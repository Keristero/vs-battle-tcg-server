const crypto = require('crypto');
const {RNG,GenerateSalt,SaltAndHashPassword} = require('./helpers')
const PouchDBManager = require('./PouchDBManager.js')
/* Key Documents */
/*
    lastCardNumber  -used when adding new cards to the DB.
*/

class UserCollectionManager {
    constructor() {
    }  
}

module.exports = new UserCollectionManager()
