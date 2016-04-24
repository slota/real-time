const http = require('http');
var helpers = require('express-helpers')();
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

app.post('/poll', function (req, res){
  console.log("poll")
  var poll = req.body.poll
  poll["open"] = true;
  console.log(req.body.poll)
  poll["id"] = Math.random()
  poll["voteCount"] = {}
  for(i = 0; i < poll.options.length; i++){
    if(poll.options[i] !== "") {
      poll.voteCount[poll.options[i]] = 0
    }
  }
  app.locals.poll = poll

  res.redirect('/admin-view/' + poll["id"]);
});

app.get('/polls/:id', function (req, res){
  console.log("polls id")
  res.render('poll', { data: app.locals.poll })
} )

app.get('/admin-view/:id', function (req, res){
  console.log("get admin view")
  res.render('admin-view', { data: app.locals.poll })
} )

// app.get('/', function(req, response){
//   response.send('hello world');
//   console.log("IS THIS WORKING!?!")
// });

// app.get('/', (request, response) => {
// });


io.on('connection', function (socket) {

  console.log('A user has connected.', io.engine.clientsCount);

  io.sockets.emit('userConnection', io.engine.clientsCount);


  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      votes[socket.id] = message;
      console.log("before countVotes")
      console.log(votes[socket.id])
      countVotes(votes);
      votes = {}
      console.log("after countvotes")
      socket.emit('voteMessage', "You voted for " + message);
      io.sockets.emit('displayCount', app.locals.poll["voteCount"]);
    }
  });

  console.log("sockets")
  console.log(app.locals.poll["voteCount"])
  io.sockets.emit('displayCount', app.locals.poll["voteCount"]);


  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    delete votes[socket.id];
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    delete votes[socket.id];
    console.log(votes);
    io.sockets.emit('usersConnected', io.engine.clientsCount);
  });
});

function countVotes(votes) {
  // console.log(votes.value)
  // console.log(app.locals.poll.voteCount)
  // console.log(!(votes.value in app.locals.poll.voteCount))
  // if(!(votes.value in app.locals.poll.voteCount)){
  //   app.locals.poll.voteCount[votes.value] = 0
  // }
  // //   app.locals.poll.voteCount.votes.value = 0
  // // }
  console.log( "stage 2")
  console.log(votes)
  for (var vote in votes) {
    app.locals.poll.voteCount[votes[vote]]++
  }
  return app.locals.poll.voteCount;
}

// if (!module.parent) {
//   app.listen(app.get('port'), () => {
//     console.log(`${app.locals.title} is running on ${app.get('port')}.`);
//   });
// }

module.exports = app;
