const Joi = require('joi');

exports.asAuth = (data) => {
    const schema = Joi.object().keys({
        username: Joi.string().min(5).max(13).required(),
        password: Joi.string().min(5).required()
    })

    if(Joi.validate(data, schema).error) {
        throw new Error('wrong params');
    }
}

