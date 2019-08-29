const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-adapter-node-websql'));

const Validator = new require('jsonschema').Validator();

const card_schema = {
    "id": "/card",
    "type": "object",
    "properties": {
        "schema": { "type": "string" },
        "address": { "$ref": "/SimpleAddress" },
        "votes": { "type": "integer", "minimum": 1 }
    }
}

class PouchDBManager {
    constructor() {
        this.db_cards = new PouchDB('./databases/cards.db', { adapter: 'websql' });
        this.db_users = new PouchDB('./databases/users.db', { adapter: 'websql' });
    }
}

module.exports = new PouchDBManager()
