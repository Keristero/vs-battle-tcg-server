let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')

var socket = io();
let card

socket.on('test-card-data',(cardData)=>{
    card = new RenderCard(cardData,imgLoadedCallback)
})

function imgLoadedCallback(){
    console.log('loaded img!')
    card.draw(ctx)
}