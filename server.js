const CardParser = require('vs-battle-tcg')
const express = require('express')
const app = express();
const http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('client'))


http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', async function(socket){
  let cardData = await GetRandomCharacterCard(10)
  socket.emit('test-card-data',cardData)
});

CardParser.GetCardDataFromURL("https://vsbattles.fandom.com/wiki/Special:Random").then((result)=>{
    console.log(result)
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