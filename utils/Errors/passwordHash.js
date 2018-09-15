var crypto = require('crypto');
var settings = require('../settings/settings');
var salt = settings.salt;
//sha-256 password + salt -> askdlfjqwldfkqwjldvcjasldkfnlkaefjqweklfjcsd

exports.cryptoThePassword = (password) => {
    return crypto.createHash('sha1').update(password + salt).digest('hex');
}
