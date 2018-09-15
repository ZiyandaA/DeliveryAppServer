var express = require('express');
var router = express.Router();
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
  //console.log(name, password, adress, roleID);
  models.User.findOne({ name })
    .then(user => {
      console.log(user);
      if(user) {
        return res.status(409).send({ 
          status: "fail", 
          message: "user already exist"
        })
      }
      return models.User.create({ name, password })
    })
    .then(user => {
      req.session.user = user;
      res.status(201).send({
        status: "success",
        user,
        message: "user created!"
      });
    })
    .catch(err => {
      res.status(500).send({
        status: "fail", 
        message: "internal server error"
      });
    })
})

router.post('/signin', (req, res, next) => {
  const {name, password} = req.body;

  models.User.findOne({ name })
    .then(user => {
      if (user && user.password == password) {
  
        req.session.user = user;
        res.status(200).send({
          status: "success",
          user,
          message: "login succesful!"
        });
      }
      else {
        res.status(403).send({
          status: "fail", 
          message: 'wrong username or password'
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        status: "fail", 
        message: "internal server error"
      });
    })
})

router.post('/logout', (req, res, next) => {
  console.log("LOGOUT ROUTE")
  if (req.session.user) {
    console.log("a")
    req.session.destroy(() => {
      console.log("ab")
      return res.status(200).send({destroyed: true})
      
    })
    console.log("ad")
  }
  else {
    console.log("ac")
   return res.status(400).json({ message: 'You are not logged in'})
  }
  res.sendStatus(200)
})




module.exports = router;
