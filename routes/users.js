
const bcrypt= require('bcryptjs');

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

router.post("/signup", async (req, res, next) => {
  let {name, password} = req.body;

  try {
    name = name.trim();
    password = password.trim();
    
    let users = await models.User.find({name});
    // console.log(user);
    if (users.length > 0) {
      // found user
      return res.status(409).json({
        status: "fail",
        message: "Sorry, this user exists already"
      });
    } else {
      // user not found
      // create the user
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);
    
      await models.User.create({
        name,
        password: hash
      })
      let user = await models.User.findOne({name});
    
      // create token
      let token = jwt.sign({
        name: user.name,
        password: user.password
      }, "our secret");
      
      return res.status(200).json({
        status: "success",
        message: "Sign up success",
        token,
        user
      });

    }

  
  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "interval server error"
    })
  }

})

router.post('/signin', async (req, res, next) => {
  let {name, password} = req.body;
  name = name.trim();
  password = password.trim();

  // validation
  if (name == "" || password == "") {
    return res.status(400).json({
      status: "error",
      message: "User name or password cannot be empty"
    })
  };

  try {

    let user = await models.User.findOne({name})

    if (!user) {
      // user not found
      return res.status(400).json({
        status: "error"
      })
    }

    // console.log(users);

    // user found
    let passwordHash = user.password;
    let isCorrect = bcrypt.compareSync(password, passwordHash);

    // if password is not correct, return an error
    if (!isCorrect) {
      return res.status(400).json({
        status: "error"
      })
    }

    // now the password is correct
    let token = jwt.sign({
      name: user.name,
      password: user.password
    }, "our secret");
    return res.status(200).json({
      status: "success",
      token,
      user
    })


  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: "error",
      message: "interval server error"
    })
  
  }



})



module.exports = router;
