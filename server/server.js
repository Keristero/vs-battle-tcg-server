// @ts-nocheck
const config = require("./config.json")
const express = require("express");
const session = require('express-session')
const url = require('url');
const fs = require('fs')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const http = require('http')
const https = require('https')
const path = require('path')
const PouchDBManager = require('./PouchDBManager.js')
const {RNG,GenerateSalt,SaltAndHashPassword} = require('./helpers')
let productionEnvironment = false
console.log(`productionEnvironment = ${productionEnvironment}`)

const app = express()
let server;

if(productionEnvironment){
  const privateKey  = fs.readFileSync(path.join(__dirname,"..","certs","private.pem"), 'utf8');
  const certificate = fs.readFileSync(path.join(__dirname,"..","certs","public.pem"), 'utf8');
  const credentials = {key: privateKey, cert: certificate}
  server = https.createServer(credentials,app);
}else{
  server = http.createServer(app);
}
const io = require('socket.io')(server);

let sessionMiddleware = session({
  store: new FileStore({}),
  secret: 'N0ty0urS3cr3t',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: productionEnvironment, maxAge: 86400000}//Need to set secure to true for HTTPS
})

app.use(express.static(path.join(__dirname,"..","client")))
app.use(bodyParser());
app.use(sessionMiddleware)
io.use(function(socket,next){
  sessionMiddleware(socket.request,{},next);
})

//Routes

let PATH_LOGIN = "/public/login/login.html"
let PATH_MENU = "/secure/menu/menu.html"

//Middleware
app.use((req, res, next) => {
  if(!req.path.match(/^secure/)){
    //If request is for a public path, allow request
    next()
  }else{
    if(req.session.loggedIn){
      //If user is logged in, allow request
      next()
    }else{
      //If user is not logged in, redirect user to login
      res.redirect("/login");
    }
  }
});

//Posts
//Login
app.post(PATH_LOGIN, async function(req, res){
  try{
    let username = req.body.username
    let password = req.body.password
    let existingUser = await PouchDBManager.GetUserDocument(username)
    if(!existingUser){
      throw(`The user ${username} does not exist`)
    }
    let submittedHash = SaltAndHashPassword(password,existingUser.salt)
    if(submittedHash == existingUser.password){
      req.session.loggedIn = true
      req.session.user = existingUser
      req.session.save(function(err) {
        console.log('User logged in')
        res.redirect(PATH_MENU);
      })
    }else{
      throw(`Hash does not match`)
    }
  }catch(e){
    console.warn(`Login attempt (name:${req.body.username} pass:${req.body.password})`,e)
    res.redirect(url.format({pathname:PATH_LOGIN,query:{"mesg":"Invalid credentials"}}));
  }
})

//Gets
app.get('/', (req, res) => {
  if(req.session.loggedIn){
    res.redirect(url.format({pathname:PATH_MENU}));
  }else{
    res.redirect(url.format({pathname:PATH_LOGIN}));
  }
});

io.on('connection', async(socket)=>{
  console.log("socket.io connection")
  /*
  socket.on("requestDeviceInfo",async ()=>{
    if(socket.request.session.loggedIn){
      console.log(`${socket.id} requested device info`)
      await deviceManager.UpdateLocalDeviceInfo()
      let info = {deviceInfo:deviceManager.deviceInfo,testedDevices:deviceManager.testedDevices}
      socket.emit('info', info);
    }else{
      console.log(`${socket.id} requested device info, but they are not logged in :(`)
      socket.emit('info', {});
    }
  })
  */
});

let hostPort = 3000
server.listen(hostPort, () => console.log(`Server running on port:${hostPort}`));