const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-adapter-node-websql'));
const crypto = require('crypto');
const RNG = require('./helpers').RNG
//For debugging
var pouchdbDebug = require('pouchdb-debug');
PouchDB.plugin(pouchdbDebug);
//PouchDB.debug.enable('*');

/* Key Documents */
/*
    lastCardNumber  -used when adding new cards to the DB.
*/

const TYPES = {
    CARD:"card",
    METADATA:"metadata"
}

const STATICID = {
    METADATA:"metadata"
}

class PouchDBManager {
    constructor() {
        this.ready = false
        this._Init()
    }
    async _Init(){
        this.db = new PouchDB('./databases/pouch.db', { adapter: 'websql' });
        await this._LoadMetadata()
        await this._InitIndexes()
        this.ready = true
        return;
    }
    async _InitIndexes(){
        this.db.createIndex({index: {fields: ['card_number']}});
        return;
    }
    async _PutData(typeName,attributes,id,existingDoc,attachments){
        console.log(`PouchDBManager Putting ${typeName}`)
        //Create default doc
        let document = {
            _id:id,
            _rev:null,
            type:typeName,
            ...attributes
        }
        //If we already have this doc, update it instead
        if(existingDoc){
            document = existingDoc
        }
        document._attachments = attachments

        await this.db.put(document)
    }
    async _SaveMetadata(){
        console.log("PouchDBManager Saving Metadata")
        await this.db.put(this._metadata)
    }
    async _LoadMetadata(){
        console.log("PouchDBManager Loading Metadata")
        try{
            this._metadata = await this.db.get(STATICID.METADATA)
            console.log("PouchDBManager Loaded Metadata",this._metadata)
        }catch(e){
            console.log(e)
        }
        if(!this._metadata){
            console.log("PouchDBManager Initializing Metadata in DB")
            let doc = {
                _id:STATICID.METADATA,
                _rev:null,
                type:TYPES.METADATA,
                total_cards:0
            }
            this._metadata = await this.db.put(doc)
            this._LoadMetadata()
        }
        return;
    }
    async AddCard(cardData){
        console.log("PouchDBManager Adding Card")
        let uniqueID = crypto.createHash('md5').update(cardData.url).digest('hex');
        //Prepare image attachment
        let attachments = {
            'image':{
                content_type: "text/plain",
                data:Buffer.from(cardData.image)
            }
        }
        //get rid of old data
        delete cardData.image
        delete cardData.images

        //document attributes
        let documentAttributes = {
            data:cardData,
        }

        //Add document, or update it if it already exists
        let existingDoc;
        try{
            existingDoc = await this.db.get(uniqueID)
        }catch(e){
            console.log("no existing doc, meh")
        }
        try{
            documentAttributes.card_number = this._metadata.total_cards
            this._PutData(TYPES.CARD,documentAttributes,uniqueID,existingDoc,attachments)
            this._metadata.total_cards++
            await this._SaveMetadata()
        }catch(e){
            console.log(e)
        }
    }
    async GetRandomCardDocument(){
        let i = RNG(0,this._metadata.total_cards-1)
        let result = await this.db.find({selector:{card_number:{$eq: i}}})
        let carDoc = result.docs[0]
        console.log(`got card ${i}`)
        return carDoc
    }
    async GetDocumentAttachment(docId,attachmentId){
        let attachment = await this.db.getAttachment(docId,attachmentId);
        return attachment
    }
}

module.exports = new PouchDBManager()
