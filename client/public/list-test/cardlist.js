// @ts-ignore
var socket = io();

socket.on('card-list',(cardDocumentListCompressed)=>{
    // @ts-ignore
    let cardDocumentList = jsonpack.unpack(cardDocumentListCompressed).docs
    console.log(cardDocumentList)
    for(let document of cardDocumentList){
        CreateCard(document)
    }
})