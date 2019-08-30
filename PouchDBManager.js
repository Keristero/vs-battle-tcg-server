const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-adapter-node-websql'));
const crypto = require('crypto');
//For debugging
var pouchdbDebug = require('pouchdb-debug');
PouchDB.plugin(pouchdbDebug);
PouchDB.debug.enable('*');

/* Key Documents */
/*
    lastCardNumber  -used when adding new cards to the DB.
*/



class PouchDBManager {
    constructor() {
        this.db = new PouchDB('./databases/pouch.db', { adapter: 'websql' });
    }
    async _AddData(schemaName,attributes,id,existingDoc,attachments){
        //Create default doc
        let document = {
            _id:id,
            _rev:null,
            schema:schemaName,
            ...attributes
        }
        //If we already have this doc, update it instead
        if(existingDoc){
            document = existingDoc
        }
        document._attachments = attachments

        await this.db.put(document)
    }
    async AddCard(cardData){
        let uniqueID = crypto.createHash('md5').update(cardData.url).digest('hex');
        //Prepare image attachment
        let imgInfo = this.ParseImgDataURL(cardData.image)
        let attachments = {
            'image':{
                content_type: imgInfo.format,
                data:imgInfo.data
            }
        }
        //get rid of old data
        delete cardData.image

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
        this._AddData("card",documentAttributes,uniqueID,existingDoc,attachments)
    }
    ParseImgDataURL(dataURL){
        let parts = dataURL.split(",")
        let header = parts[0]
        let data = parts[1]

        let headerParts = header.split(";")
        let format = headerParts[0].replace("data:","")
        let encoding = headerParts[1]

        let info = {
            format:format,
            encoding:encoding,
            data:Buffer.from(data)
        }
        return info
    }
}

module.exports = new PouchDBManager()
