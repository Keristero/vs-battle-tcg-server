let btn_openPack = document.getElementById("btn_openPack");
btn_openPack.onclick = openPack

async function openPack(){
    let response = await axios.get(`/open-pack`)
    let cardDocumentsCompressed = response.data
    console.log('cardDocumentsCompressed',cardDocumentsCompressed)
    // @ts-ignore
    let cardDocuments = jsonpack.unpack(cardDocumentsCompressed)
    console.log("card documents",cardDocuments)
    for(let card of cardDocuments){
        CreateCard(cardDocument)
    }
}