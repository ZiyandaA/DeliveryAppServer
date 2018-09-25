var mongoose = require('mongoose');


var userSchema = mongoose.Schema({
    username: {
        type: String,
        unique:true,
    },
    password: String

})

var User = mongoose.model('User', userSchema);

module.exports = User;