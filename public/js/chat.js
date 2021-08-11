const socket = io();
const username = localStorage.getItem('username');
const chatBox = document.getElementById('chat-box');

var sendBtn = document.getElementById('send-message');
var messageInput = document.getElementById('message-item');
var userList = [];
socket.on("serveMessage",(message) => {
    chatBox.scrollTop = chatBox.scrollHeight;
    console.log("User list: " + userList);
    if(userList.length == 0){
       if(message.user_name == username){
        userList.push(message.user_name);
        displayMessage(message);
        console.log(userList)
       } else{
            displayOtherUserMessage(message);
            userList.push(message.user_name);
            console.log(userList);
       }
    }else if((userList[userList.length - 1] === message.user_name) && (message.user_name == username)){
        displayNextMessage(message);
        console.log(userList[userList.length - 1]);
    }
    else if((userList[userList.length - 1] != message.user_name) && (message.user_name != username)){
        displayOtherUserMessage(message);
        userList.push(message.user_name);
        console.log(userList);
    }
    else if((userList[userList.length -1] == message.user_name) && (message.user_name != username)){
        displayNextOtherUserMessage(message);
    }
})

sendBtn.addEventListener('click',() =>{
    var messageToSend = messageInput.innerText;
   // console.log(messageToSend);
    sendUserMes(messageToSend);
    messageInput.innerText = "";
})


// ........................Functions-For-Script............................................
function sendUserMes(message) {
    var timeOfSending = new Date().toLocaleTimeString().replace(/(?!:\d\d:)(:\d\d)/,"");
    var userMessage = {
        user_name: username,
        message,
        time: timeOfSending
    };
    socket.emit('message', userMessage);

}

function displayMessage(message){
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
        console.log("form displayMessage");
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
    console.log("from dispalyNextMessage");
}

function displayOtherUserMessage(message){
    var newDiv = document.createElement('div');
    newDiv.classList.add('other_user');
    newDiv.innerHTML = `
    <div class="user_details">
                <img src="/images/ava.svg" alt="avatar" />
                <span>${message.user_name}</span>
                <span class="time">${message.time}</span>
            </div>
            <p>${message.message}</p>
    `;
    chatBox.appendChild(newDiv);
    console.log("from displayOtherUserMessage");
}

function displayNextOtherUserMessage(message){
    var newDiv = document.createElement('div');
    newDiv.classList.add('other_next_message');
    newDiv.innerHTML = `
    <div class="time_box">
    <span class="time">${message.time}</span>
</div>
<p>${message.message}</p>
    `;
    chatBox.appendChild(newDiv);
    console.log("from displayNextOtherUserMessage");
}