const crypto = require('crypto');

module.exports.RNG = function(min, max){ // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports.GenerateSalt = function(length){
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
};

module.exports.SaltAndHashPassword = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return value
};