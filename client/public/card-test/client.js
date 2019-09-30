// @ts-ignore
axios.get(`/card/random/new`).then((response)=>{
    let cardDocumentCompressed = response.data
    console.log('cardDocumentCompressed',cardDocumentCompressed)
    // @ts-ignore
    let cardDocument = jsonpack.unpack(cardDocumentCompressed)
    console.log("card document",cardDocument)
    CreateCard(cardDocument)
})

console.log("loaded client")