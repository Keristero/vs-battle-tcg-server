let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')

var socket = io();
let card

socket.on('test-card-document',(cardDocumentCompressed)=>{
    let cardDocument = jsonpack.unpack(cardDocumentCompressed)
    console.log(cardDocument)
    let cardData = cardDocument.data
    let documentID = cardDocument._id
    cardData.image = `/attachment/${documentID}/image`
    card = new RenderCard(cardData,imgLoadedCallback)
    //card.draw(ctx)
})

function imgLoadedCallback(){
    console.log('loaded img!')
    card.draw(ctx)
}

console.log("loaded client")