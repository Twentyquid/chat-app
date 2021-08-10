const port = 5000;
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const session = require("express-session");
const { doesNotMatch } = require("assert");
const socketio = require("socket.io");
const io = socketio(server);


const session_name = "sid1"


app.use(express.static(__dirname + '/public'));
app.use(session({
    name: session_name,
    resave: false,
    saveUninitialized: false,
    secret: "killerboy123",
    cookie:{
        maxAge: 2536000000,
        sameSite: true,
        secure: false
    }
}));



// ........................Middlewares-for-Processing-Client-Connections......................................
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// #############################################################################################################


// >>>>>>>>................Setting-Up-Socket.io-For-Chat-Messages...................>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
io.on("connection",(socket) =>{
    console.log("New socket connection");
});
// ......................................................................................................


//connectin to the mongodb database...............................................................
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
// ...............................................................................................


// ..................................Functions-for-Database-connection..........................................................
async function connectingDatabase(){
    await client.connect();
    console.log("connected successfully to the server");
    const collection = client.db("app_users").collection("details");
    const result = await collection.find().project({ username: 1, password: 1 }).toArray();
    return result;
}

async function addItemsToDatabase(item){
    await client.connect();
    console.log("Connected to database for adding items");
    const collection = client.db("app_users").collection("details");
    const result = await collection.insertOne(item);
    return result;
}

// #############################################################################################################



// database connection and querying.............................................................................
connectingDatabase()
.then(console.log)
.catch(console.log)
.finally(() => client.close());
//.............................................................................................................


// ...........................ROUTING-TAKES-PLACE-HERE.........................................................
app.get("/",(req,res)=> {
    res.sendFile("./views/index.html",{root: __dirname});
});

app.get("/messages",(req,res)=>{
    console.log("user session " + req.session.userName)
    if(req.session.userName){
    res.sendFile("./views/messages.html",{root: __dirname});
    }else{
        res.redirect(301,"/login");
    }
});

app.get("/login",(req,res)=>{
    res.sendFile("./views/login.html",{root: __dirname});
});

app.get("/register",(req,res)=>{
    res.sendFile("./views/register.html",{root: __dirname});
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
    req.session.userName = creds.username;
    res.redirect(301,"/messages");
});
// ...............................................................................................................


server.listen(port,() =>{
    console.log(`server is running on port ${port}`);
})


//functions for conecting to the database.....
