var socket = io();

var connectionCount = document.getElementById('connection-count');
var statusMessage = document.getElementById('status-message');
var buttons = document.querySelectorAll('#choices button');
var currentTally = document.getElementById('current-tally');
var voteMessage = document.getElementById('vote-message');
var haventVoted = true;

socket.on('usersConnected', function (count) {
  debugger
  connectionCount.innerText = 'Connected Users: ' + count;
});

socket.on('statusMessage', function (message) {
  debugger
  statusMessage.innerText = message;
});

socket.on('displayCount', function (message) {
  debugger
  currentTally.innerText = JSON.stringify(message, null, 4);

});

socket.on('voteMessage', function (message) {

  debugger
  voteMessage.innerText = message;
});

socket.on('voteCount', function (votes) {
  debugger


  currentTally.innerText = JSON.stringify(votes, null, 4);
  console.log(votes);
});

for (var i = 0; i < buttons.length; i++) {


  buttons[i].addEventListener('click', function () {

    console.log("jesus christ rockes")
    if (haventVoted) {
      debugger
      haventVoted = false
      socket.send('voteCast', this.innerText);
    } else {
      debugger
      voteMessage.innerText = "You've already voted, sorry :("
    }
  });
}
