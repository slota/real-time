var socket = io();

var connectionCount = document.getElementById('connection-count');
var statusMessage = document.getElementById('status-message');
var buttons = document.querySelectorAll('#choices button');
var currentTally = document.getElementById('current-tally');
var voteMessage = document.getElementById('vote-message');
var haventVoted = true;
var closedPoll = false;

socket.on('pollClosed', function(poll){
  closedPoll = true;
  var record = JSON.stringify(poll);
  localStorage.setItem(poll.id, record);
})

socket.on('statusMessage', function (message) {
  statusMessage.innerText = message;
});

socket.on('displayCount', function (poll) {
  if(poll.status === 'closed'){
    closedPoll = true
  }
  currentTally.innerText = JSON.stringify(poll["voteCount"], null, 4);
});

socket.on('voteMessage', function (message) {
  voteMessage.innerText = message;
});

socket.on('voteCount', function (votes) {
  currentTally.innerText = JSON.stringify(votes, null, 4);
  console.log(votes);
});

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    if (closedPoll) {
      voteMessage.innerText = "This poll has been ended"
    } else if (haventVoted) {
      haventVoted = false
      socket.send('voteCast', this.innerText);
    } else {
      voteMessage.innerText = "You've already voted, sorry :("
    }
  });
}
