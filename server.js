const CardParser = require('vs-battle-character-to-tcg')
const express = require('express')
const app = express();
const http = require('http').createServer(app);
const PouchDBManager = require('./PouchDBManager')
const jsonpack = require('jsonpack/main')
var io = require('socket.io')(http);

app.use(express.static('client'))


http.listen(3000, function(){
  console.log('listening on *:3000');
});

function emitCompressed(socket,topic,data){
  let compressed = jsonpack.pack(data)
  socket.binary(true).emit(topic,compressed)
}

io.on('connection', async function(socket){
  let cardDocument = await PouchDBManager.GetRandomCardDocument()
  //console.log('CARDDATA',cardDocument)
  emitCompressed(socket,'test-card-document',cardDocument)
});

//Used by the clients to load all images, uses request so that it can be cached
app.get('/attachment/:docId/:attachmentId',async(req,res)=>{
  let attachment = await PouchDBManager.GetDocumentAttachment(req.params.docId,req.params.attachmentId)
  res.send(attachment)
})

async function GetRandomCharacterCard(maxAttempts = 10){
  let attempt = 1
  let cardData
  while(attempt <= maxAttempts){
    try{
      let cardData = await CardParser.GetCardDataFromURL("https://vsbattles.fandom.com/wiki/Special:Random")
      return cardData
    }catch(e){
      attempt++
    }
  }
  return null
}


GetRandomCharacterCard(10).then(async(data)=>{
  await PouchDBManager.AddCard(data)
})