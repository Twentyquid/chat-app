const socket = io();
const chatBox = document.getElementById('chat-box');

var sendBtn = document.getElementById('send-message');
var messageInput = document.getElementById('message-item');
console.log(location.search);

var search = location.search;
var modsearch = search.replace("?","");
var firstlist = modsearch.split("&");
var namelist = firstlist[0].split("=");
var roomlist = firstlist[1].split("=");
namelist.push(...roomlist);
console.log(firstlist);
console.log(roomlist);
console.log(namelist);
var someobject = {};
for(i = 0; i < namelist.length; i++){
    if(i % 2 === 0){
        someobject[namelist[i]] = namelist[i + 1];
    }
}
console.log(someobject);
const username = someobject.username;
const presentgroup = someobject.group;

var cacheMessages = [];

var userList = [];

// load saved messages on document load..........
window.addEventListener('load',showSavedMessages());


socket.on("serveMessage",(message) => {
    cacheMessages.push(message);
   addingMessages(message);
   console.log("showing cached message when message comes: " + cacheMessages);
   if(cacheMessages.length <= 10){
        addToLocalStorage(cacheMessages);
   }else{
       cacheMessages.splice(0,1);
       console.log("slpliced Message :" + cacheMessages);
       addToLocalStorage(cacheMessages);
   }
scollBox();
})

sendBtn.addEventListener('click',() =>{
    var messageToSend = messageInput.innerText;
   // console.log(messageToSend);
    sendUserMes(messageToSend);
    messageInput.innerText = "";
})


// ........................Functions-For-Script............................................
function sendUserMes(message) {
    var userMessage = {
        user_name: username,
        message,
        group: presentgroup
    };
    console.log(userMessage);
    socket.emit('message', userMessage);

}

function displayOtherUserMessage(message){
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
     //   console.log("form displayOtherUserMessage");
}

function displayNextOtherUserMessage(message) {
    var newDiv = document.createElement('div');
    newDiv.classList.add('next_message');
    newDiv.innerHTML = `
    <div class="time_box">
        <span class="time">${message.time}</span>
    </div>
    <p>${message.message}</p>
     `;
    chatBox.appendChild(newDiv);
//    console.log("from dispalyNextOtherUserMessage");
}

function displayMessage(message){
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
 //   console.log("from displayMessage");
}

function displayNextMessage(message){
    var newDiv = document.createElement('div');
    newDiv.classList.add('other_next_message');
    newDiv.innerHTML = `
    <div class="time_box">
    <span class="time">${message.time}</span>
</div>
<p>${message.message}</p>
    `;
    chatBox.appendChild(newDiv);
 //   console.log("from displayNextMessage");
}

function scollBox(){
 //   console.log("Inside scroll function");
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addingMessages(message) {
    if(message.message != ""){
        if(message.message.trim() != ""){
        // chatBox.scrollTop = chatBox.scrollHeight;
    //   console.log("User list: " + userList);
        if(userList.length == 0){
            console.log("userList is empty");
        if(message.user_name == username){
        //    console.log("user name is the user's name")
        //   console.log("funtion: displayMessage")
            userList.push(message.user_name);
            displayMessage(message);
        //    console.log(userList)
        } else{
        // console.log("username is not the user's name" + message.user_name);
                displayOtherUserMessage(message);
                userList.push(message.user_name);
            //    console.log(userList);
        }
        }else if((userList[userList.length - 1] == message.user_name) && (message.user_name == username)){
        //   console.log("funtion displayNextMessage");
            displayNextMessage(message);
            console.log(userList[userList.length - 1]);
        }
        else if((userList[userList.length - 1] != message.user_name) && (message.user_name != username)){
        //   console.log("function: displayOtherUserMessage");
            displayOtherUserMessage(message);
            userList.push(message.user_name);
        //    console.log(userList);
        }
        else if((userList[userList.length -1] == message.user_name) && (message.user_name != username)){
        //   console.log("function: displayNextOtherUserMessage");
            displayNextOtherUserMessage(message);
        }else if(userList[userList.length - 1] != message.user_name && message.user_name == username){
        //    console.log("function: displayMessage")
            displayMessage(message);
            userList.push(message.user_name);
        }
    }
    }
}

function addToLocalStorage(item){
    if (window.localStorage){
        var jsonItem = JSON.stringify(item);
        localStorage.setItem('cachedMessages',jsonItem);
    }
}

function getItemFromLocalStorage(){
    var finalItem = JSON.parse(localStorage.getItem('cachedMessages'));
    cacheMessages = finalItem;
    return finalItem;
}

function showSavedMessages(){
    console.log("Inside showsaved Messages")
    var messageItems = getItemFromLocalStorage();
    console.log("message items in showsaved messages: " + messageItems);
    if(messageItems){
    messageItems.forEach(mesItem => {
        addingMessages(mesItem);
    })
    }
}