var express = require('express');
var router = express.Router();
var models = require('../models');


router.post('/', async (req, res, next) => {
    try {
        const {
            name
        } = req.body;
        const role = await models.Role.create({
            name
        });
        res.send(role);
    }
    catch (err) {
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    const roles = await models.Role.find();
    res.send(roles);
})

module.exports = router;
