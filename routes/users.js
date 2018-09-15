var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var models = require('../models');
/* GET users listing. */
router.get('/', async function(req, res, next) {
  let users = await models.User.find();
  res.send(users);
});



router.get('/:id', async (req, res, next) => {
  try {
    let user = await models.User.findById(req.params.id).lean().exec();
    let orders = await models.Order.find({customerID: req.params.id});
    user.orders = orders;
    res.send(user);

  }
  catch (err) {
    next(err);
  }
})

router.post("/signup", (req, res, next) => {
  const {name, password} = req.body;
  console.log(req.body);
  if(!(name.trim() && password.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Enter a name and a password'
    })
  }
  //console.log(name, password, adress, roleID);
  models.User.findOne({ name })
    .then(user => {
      console.log(user);
      if(user) {
        return res.status(409).send({
          status: "fail",
          message: "Sorry, this user exists already"
        })
      }
      return models.User.create({ name, password });
    })
    .then(user => {
      // req.session.user = user;
      const token = jwt.sign({...req.body}, process.env.SECRET);
      return res.status(201).json({
        status: "success",
        user: {
          name: user.name,
          _id: user._id
        },
        message: "Signup successful!",
        token
      });
    })
    .catch(() => {
      return res.status(500).send({
        status: "fail",
        message: "internal server error"
      });
    })
})

router.post('/signin', (req, res, next) => {
  const {name, password} = req.body;
  if(!(name.trim() && password.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Enter a name and a password'
    })
  }
  models.User.findOne({ name })
    .then(user => {
      if (user && user.password == password) {
        // req.session.user = user;
        const token = jwt.sign({...req.body}, process.env.SECRET);
        return res.status(200).send({
          status: "success",
          user: {
            name: user.name,
            _id: user._id
          },
          message: "Login succesful!",
          token
        });
      }
      else {
        return res.status(403).send({
          status: "fail",
          message: 'Unauthorized, invalid username or password'
        });
      }
    })
    .catch(() => {
      return res.status(500).send({
        status: "fail",
        message: "internal server error"
      });
    })
})

router.post('/logout', (req, res, next) => {
  console.log("LOGOUT ROUTE")
  if (req.session.user) {
    req.session.destroy(() => {
      return res.send({destroyed: true})
    })
  }
  else {
   return res.status(400).json({ message: 'You are not logged in'})
  }
})



module.exports = router;
