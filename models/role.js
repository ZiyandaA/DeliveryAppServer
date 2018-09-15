var mongoose = require('mongoose');


var roleSchema = mongoose.Schema({
    name: String
})
var Role = mongoose.model("Role", roleSchema);
module.exports = Role;

