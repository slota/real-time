const http = require('http');
const express = require('express');

const app = express();


const port = process.env.PORT || 3000;

const server = http.createServer(app)
.listen(port, function () {
  console.log('Listening on port ' + port + '.');
});

const socketIo = require('socket.io');
const io = socketIo(server);
const bodyParser = require('body-parser')

var votes = {};

app.use(bodyParser());


app.use(express.static('public'));
// app.use(require('connect').bodyParser());


app.post('/poll', function (req, response){
  console.log(req.body)
  // console.log(response)
  // response.sendFile(__dirname + '/public/index.html');
  response.send('Hello Posting!!!');

});

app.get('/', function(req, response){
  response.send('hello world');
  console.log("IS THIS WORKING!?!")
});

// app.get('/', (request, response) => {
// });

app.set('port', process.env.PORT || 3000);

io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  io.sockets.emit('userConnection', io.engine.clientsCount);

  socket.emit('statusMessage', 'You have connected.');

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      votes[socket.id] = message;
      console.log(votes[socket.id] + "hola")
      socket.emit('voteCount', countVotes(votes));
      socket.emit('voteMessage', "You voted for " + message);
    }
  });

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    delete votes[socket.id];
    socket.emit('voteCount', countVotes(votes));
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
  var voteCount = {
      A: 0,
      B: 0,
      C: 0,
      D: 0
  };
  for (var vote in votes) {
    voteCount[votes[vote]]++
  }
  return voteCount;
}

// if (!module.parent) {
//   app.listen(app.get('port'), () => {
//     console.log(`${app.locals.title} is running on ${app.get('port')}.`);
//   });
// }

module.exports = app;
