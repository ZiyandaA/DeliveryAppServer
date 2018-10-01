// const cors = require('cors');
// const {CLIENT_ORIGIN} = require('./config');

// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// );

module.exports = {

  // other stuff
  CLIENT_ORIGIN : process.env.CLIENT_ORIGIN ||
    "http://localhost:3001"
};