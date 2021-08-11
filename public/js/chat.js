const socket = io();
const username = "bill";
const chatBox = document.getElementById('chat-box');

var sendBtn = document.getElementById('send-message');
var messageInput = document.getElementById('message-item');
var userList = [];
socket.on("serveMessage",(message) => {
    chatBox.scrollTop = chatBox.scrollHeight;
    console.log("User list: " + userList);
    if(userList.length == 0){
        userList.push(message.user_name);
        displayMessage(message);
        console.log(userList)
    }else if(userList[userList.length - 1] === message.user_name){
        displayNextMessage(message);
        console.log(userList[userList.length - 1]);
    }
})

sendBtn.addEventListener('click',() =>{
    var messageToSend = messageInput.value;
   // console.log(messageToSend);
    sendUserMes(messageToSend);
})


// ........................Functions-For-Script............................................
function sendUserMes(message) {
    var timeOfSending = new Date().toLocaleTimeString().replace(/(?!:\d\d:)(:\d\d)/,"");
    var userMessage = {
        user_name: "bill",
        message,
        time: timeOfSending
    };
    socket.emit('message', userMessage);

}

function displayMessage(message){
    if(message.user_name == username){
        var newDiv = document.createElement('div')
        newDiv.classList.add('message');
        newDiv.innerHTML = `<div class="user_details">
        <img src="/images/avatar1.svg" alt="avatar" />
        <span>${message.user_name}</span>
        <span class="time">${message.time}</span>
        </div>
        <p>${message.message}</p>
        </div>`
        chatBox.appendChild(newDiv);
    }
   
}

function displayNextMessage(message) {
    var newDiv = document.createElement('div');
    newDiv.classList.add('next_message');
    newDiv.innerHTML = `
    <div class="time_box">
        <span class="time">${message.time}</span>
    </div>
    <p>${message.message}</p>
     `;
    chatBox.appendChild(newDiv);
}