const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    type: Number,
    quantity: Number,
});

const orderSchema = mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    customer_name: String,
    customer_address: String,
    our_address: String,
    cases: packageSchema,
    bins: packageSchema,
    Vflats: packageSchema,
    additional: packageSchema,
    notes: String,
    date_time: Date,
    service: String,
    price: Number,
    distance: Number,
    confirmed: { //1,
        type: Boolean,
        default: false
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;


