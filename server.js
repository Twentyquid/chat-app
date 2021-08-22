const port = 5000;
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const session = require("express-session");
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");
const io = socketio(server);
const secret = require("./secrets");

//connectin to the mongodb database...............................................................
const uri = secret.serverUrl; // Use your own database..

const client = new MongoClient(uri);
// ...............................................................................................



const activeUsers = new Set();

/* var savedMessages = [];
connectingDatabase("saved_messages",{}).then(
    (result) => {
        savedMessages = result;
        console.log("First time looking at saved messages");
        console.log(savedMessages);
    }
).catch(console.log).finally(() => client.close());

var groupsAvailable = [];
connectingDatabase("room_details",{},{name:1,members:1,_id:0})
.then((result) => { 
    groupsAvailable = result
    return groupsAvailable;
}).then(console.log)
.catch(console.log).finally(() => client.close()); */

app.use(express.static(__dirname + '/public'));
/* app.use(session({
    name: session_name,
    resave: false,
    saveUninitialized: false,
    secret: "killerboy123",
    cookie:{
        maxAge: 2536000000,
        sameSite: true,
        secure: false
    }
})); */



// ........................Middlewares-for-Processing-Client-Connections......................................
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
// #############################################################################################################


// >>>>>>>>................Setting-Up-Socket.io-For-Chat-Messages...................>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
io.on("connection",(socket) =>{
    console.log("New socket connection");
    var presenttime = new Date().toLocaleTimeString().replace(/(?!:\d\d:)(:\d\d)/,"");
   
    socket.on("joinMessage",(message) =>{
        activeUsers.add(message.user_name);
        // for saved messages and for saving messages
    /*    savedMessages.forEach(mess =>{
            if(mess.group == message.group && (mess.usersToGet.includes(message.user_name))){
                var toSend = mess.message;
                toSend.time = getPresentTime();
                socket.emit("serveMessage",toSend);
                var messId = mess._id;
                var userToRemove = message.user_name;
                updateItemsInDatabase("saved_messages",{"_id": messId},{$pull: {"usersToGet": userToRemove }})
                .then(console.log).catch(console.log).finally(() => client.close());
            }
        });
        connectingDatabase("saved_messages",{}).then(
            (result) => {
                savedMessages = result;
                console.log("Second time looking at saved messages");
                console.log(savedMessages);
            }
        ).catch(console.log).finally(() => client.close());
        // ................................................
        console.log(activeUsers); */
        console.log("Join message from client: " + message.message + message.group);
        socket.join(message.group);
        var initialMessage = {user_name: "Server",
    time: presenttime ,message:`${message.user_name} joined the chat`}
    console.log(initialMessage);
    socket.broadcast.to(message.group).emit("initialmessage",initialMessage);
    });


    socket.on("message",(message) =>{
    /*    var availableMembers = Array.from(activeUsers);
        var membersOfGroup = groupsAvailable.filter(groupThing => groupThing.name == message.group )[0].members;
        var notAvailableMembers = membersOfGroup.filter(member => !availableMembers.includes(member));
        console.log("Not available members are : " + notAvailableMembers); */
        var presenttime = new Date().toLocaleTimeString().replace(/(?!:\d\d:)(:\d\d)/,"");
        message.time = presenttime;
        io.to(message.group).emit("serveMessage",message);
    /*    if(notAvailableMembers){
            addItemsToDatabase("saved_messages",{"group": message.group,"usersToGet":notAvailableMembers,"message":message})
            .then(console.log).catch(console.log).finally(() => client.close());
        } */
    });

    var disconMessage = {user_name:"Server",
    time:"", message:"Someone disconnected"};
    socket.on("disconnect",() => {
        io.emit("message",disconMessage);
    });
});
// ......................................................................................................




// ..................................Functions-for-Database-connection..........................................................
async function connectingDatabase(collectionName,query,projection){
    await client.connect();
    console.log("connected successfully to the server");
    const collection = client.db("appusers").collection(collectionName);
    if(projection){
    const result = await collection.find(query).project(projection).toArray();
    return result;
    } else{
        const result = await collection.find(query).toArray();
    return result;
    }
}

async function addItemsToDatabase(collectionName,item){
    await client.connect();
    console.log("Connected to database for adding items");
    const collection = client.db("appusers").collection(collectionName);
    const result = await collection.insertOne(item);
    return result;
}

async function updateItemsInDatabase(collectionName,item,update){
    await client.connect();
    const collection = client.db("appusers").collection(collectionName);
    const result = await collection.updateOne(item,update);
    return result;
}

// #############################################################################################################



// database connection and querying.............................................................................
/* connectingDatabase()
.then(console.log)
.catch(console.log)
.finally(() => client.close()); */
//.............................................................................................................


// ...........................ROUTING-TAKES-PLACE-HERE.........................................................
app.get("/",(req,res)=> {
    res.sendFile("./views/index.html",{root: __dirname});
});

app.get("/messages",(req,res)=>{
    // console.log(req.params['name']);
    console.log(req.query);
    console.log(req.cookies.username);
    // console.log("user session " + req.session.userName)
    // if(req.session.userName){
    res.sendFile("./views/messages.html",{root: __dirname});
   // }else{
       // res.redirect(301,"/login");
    //}
});

app.get("/login",(req,res)=>{
    res.sendFile("./views/login.html",{root: __dirname});
});

app.get("/register",(req,res)=>{
   // console.log(req.cookies);
    res.sendFile("./views/register.html",{root: __dirname});
});

app.get("/rooms",(req,res) => {
    res.sendFile("./views/roomjoin.html",{root: __dirname});
});

app.post("/room",(req,res) => {
    console.log(req.body);
    var groups = req.body
    var password = groups.password;
    var cookieUser = req.cookies.username;
    var itemFound = "";
    connectingDatabase("room_details",{name: groups.groupnames},{password:1,members:1,_id:0})
    .then((result) => {
        console.log(result);
        if(result[0] != undefined){
            result.forEach((item) => {
                if(item.password === password){
                    res.cookie("roomname", groups.groupnames,{maxAge: 2592000000});
                    itemFound = item;
    
                    // .................................................................. 
                   /* if(!itemFound.members.includes(cookieUser)){
                        updateItemsInDatabase("room_details",{"name":groups.groupnames},{$push:{"members": cookieUser}})
                        .then(console.log).catch(console.log).finally(() => client.close())
                    }  */
                    res.redirect(301,`/messages?username=${cookieUser}&group=${groups.groupnames}`);
                }else{
                    res.redirect(301,"/rooms");
                }
            })
        }else{
            res.redirect(301,"/login");
        }
    })
    .catch(console.log).finally(() => client.close());
   

});

app.post("/submit-user",(req,res)=>{
    var creds = req.body;
    var userCreds = {
        username: creds.username,
        email: creds.email,
        password: creds.password,
        ip_addr: req.ip
    };
    // console.log(userCreds);
    addItemsToDatabase("user_details",userCreds).then(console.log).catch(console.log).finally(() => client.close());
    res.cookie("username",creds.username,{maxAge: 2592000000});
    res.redirect(301,`/rooms`);
});

app.post("/confirm-user",(req,res) => {
    var username = req.body.username;
    var password = req.body.password;
    connectingDatabase("user_details",{username: username},{password:1})
    .then(result => {
        console.log(result);
        if(result[0] != undefined){
        result.forEach((item) => {
        if(item.password === password){
            res.cookie("username",username,{maxAge: 2592000000});
            res.redirect(301,"/rooms");
        }else{
            res.redirect(301,"/login");
        }
    })}else{
        res.redirect(301,"/register");
    }
}).catch(console.log);
});

app.get("/logout",(req, res) => {
    res.clearCookie('username','roomname');
    res.redirect(301,"/login");
});
// ...............................................................................................................

// listening on port 5000.........................................
server.listen(port,() =>{
    console.log(`server is running on port ${port}`);
})


function getPresentTime(){
    var currentTime = new Date().toLocaleTimeString().replace(/(?!:\d\d:)(:\d\d)/,"");
    return currentTime;
}