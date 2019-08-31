var socket = io();

socket.on('card-list',(cardDocumentListCompressed)=>{
    let cardDocumentList = jsonpack.unpack(cardDocumentListCompressed).docs
    console.log(cardDocumentList)
    for(let document of cardDocumentList){
        CreateCard(document)
    }
})

function CreateCard(document){
    const cardData = document.data
    const documentID = document._id
    cardData.image = `/attachment/${documentID}/image`
    const ctx = CreateCanvasCtx(400,600,document.card_number)
    card = new RenderCard(cardData,ctx)
}

function CreateCanvasCtx(width,height,id){
    let canvas = document.createElement("canvas")
    canvas.width = width;
    canvas.height = height;
    canvas.id = id;
    document.body.appendChild(canvas)
    let ctx = canvas.getContext('2d')
    return ctx
}