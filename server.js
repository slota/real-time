const http = require('http');
var helpers = require('express-helpers')();
var Firebase = require("firebase");
const express = require('express');

const app = express();

var path =require('path')

app.locals.link_to = helpers.link_to;

const port = process.env.PORT || 3000;

const server = http.createServer(app)
.listen(port, function () {
  console.log('Listening on port ' + port + '.');
});

const socketIo = require('socket.io');
const io = socketIo(server);
const bodyParser = require('body-parser')

var votes = {};

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.locals.title = 'Crowdsource';
app.locals.poll = {};

app.use(bodyParser());
app.use(express.static('public'));

app.post('/admin-view', function (req,res){
  console.log("poll is closed")
  app.locals.poll.status = "closed"
  res.redirect('/admin-view/' + app.locals.poll["id"]);
})

app.post('/poll', function (req, res){
  var poll = req.body.poll
  poll["open"] = true;
  poll["id"] = Math.random()
  poll["voteCount"] = {}
  poll["status"] = "open"
  for(i = 0; i < poll.options.length; i++){
    if(poll.options[i] !== "") {
      poll.voteCount[poll.options[i]] = 0
    }
  }
  app.locals.poll = poll
  setPollTimer(poll)

  res.redirect('/admin-view/' + poll["id"]);
});

app.get('/polls/:id', function (req, res){
  res.render('poll', { data: app.locals.poll })
} )

app.get('/admin-view/:id', function (req, res){
  res.render('admin-view', { data: app.locals.poll })
} )

app.get('/past-polls', function (req, res){
  res.render('past-polls')
} )

io.on('connection', function (socket) {

  console.log('A user has connected.', io.engine.clientsCount);

  socket.emit('showPolls')

  io.sockets.emit('displayCount', app.locals.poll);

  if(app.locals.poll.status === "closed"){
    closePoll(app.locals.poll)
  }

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      votes[socket.id] = message;
      countVotes(votes);
      votes = {}
      socket.emit('voteMessage', "You voted for " + message);
      io.sockets.emit('displayCount', app.locals.poll);
    }
  });

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    delete votes[socket.id];
    io.sockets.emit('usersConnected', io.engine.clientsCount);
  });
});

function countVotes(votes) {
  for (var vote in votes) {
    app.locals.poll.voteCount[votes[vote]]++
  }
  return app.locals.poll.voteCount;
}

function setPollTimer(poll){
  if(poll["time"] !== "None"){
    poll["time"] = Number(poll["time"])
  }

  if((typeof poll['time']) === 'number' && ((poll['time']) !== NaN)){
    setTimeout(function(){
      app.locals.poll.status = "closed"
      closePoll(poll)
    }, (poll['time'] * 1000 * 60))
  }
}

function closePoll(poll){
  io.sockets.emit('pollClosed', poll)
}



module.exports = app;
