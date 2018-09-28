const passport= require ("passport"),
LocalStrategy = require('passport-local').Strategy,
User = require('../models/user');
passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (user.password !=password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));

  passport.use("local-signup",new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (user) {
          return done(null, false, { message: ' username Taken.' });
        }
        user = new User();
        user.username = username
        user.password = password
        user.save(function(error){
            if (error){
                return done(error);
            }
            return done(null, user);
        })
        
      });
    }
  ));