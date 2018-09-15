var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/check", (req, res, next) => {
//   console.log('IM HERE--')

  try {
    if (req.session.user)
    res.send(req.session.user);
    else 
    res.status(204).send({message: 'you are not authorized'})
  }
  catch (err) {
    console.log(err, 'this is erro');
  }
})

module.exports = router;
