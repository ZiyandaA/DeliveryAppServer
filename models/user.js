var mongoose = require('mongoose');
const bcrypt= require('bcryptjs');


var UserSchema = mongoose.Schema({
    name: {
        type: String,
        unique:true,
    },
    password: String

})
UserSchema.statics.hashPassword = function(password) { return bcrypt.hash(password, 10); }
UserSchema.methods.validatePassword = function(password) { return bcrypt.compare(password, this.password); }

var User = mongoose.model('User', UserSchema);


module.exports = User;