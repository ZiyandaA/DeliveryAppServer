const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const convert = require('convert-units');

const models = require('../models');
const settings = require("../Settings/settings");
const sgTransport = require('nodemailer-sendgrid-transport');

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCU6xhwy9D9dSriH_20MCz3_bGzgccOiRk',
    Promise: Promise
});

// GET an order
router.get('/:orderId', async (req, res, next) => {
    const { orderId } = req.params;

    try {
        const order = await models.Order.findById(orderId);

        if (order === null) {
            throw new Error(`An order with with orderId: ${orderId} does not exists`);
        }

        res.status(200).send({ order, status: 'success' })
    } catch (e) {
        return res.status(404).send({
            status: 'fail',
            message: `An order with with orderId: ${orderId} does not exists`
        })
    }
});

// DELETE an order
router.delete('/:orderId', async (req, res, next) => {
    const { orderId } = req.params;
    try {
        const order = await models.Order.findByIdAndDelete(orderId);

        if (order === null) {
            throw new Error(`An order with with orderId: ${orderId} does not exists`);
        }

        res.status(200).send({
            message: 'Order deleted successfully!',
            status: 'success'
        });
    } catch (e) {
        res.status(400).send({
            message: `An order with with orderId: ${orderId} does not exists`,
            status: 'fail'
        });
    }
});

// UPDATE an order
router.put('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const {
        customer_address,
        our_address,
        bins,
        cases,
        Vflats,
        additional,
    } = req.body.order;
    const { pricing } = settings;

    const pBins = pricing.bins[Number(bins.type)] * bins.quantity;
    const pCases = pricing.cases[Number(cases.type)] * cases.quantity;
    const pVflats = pricing.Vflats[Number(Vflats.type)] * Vflats.quantity;
    const pAdditional = pricing.additional_fees[Number(additional.type)] * additional.quantity;

    const basePrice = pBins + pCases + pVflats + pAdditional;

    let distance;

    try {
        const distances = await googleMapsClient.distanceMatrix({
            origins: [our_address],
            destinations: [customer_address],
            units: 'imperial',
        }).asPromise();
        distance = convert(distances.json.rows[0].elements[0].distance.value)
            .from('m').to('mi');
    } catch (e) {
        return res.status(500).send({
            status: 'fail',
            message: 'internal server error'
        })
    }
    const price = (basePrice + (distance * settings.pricePerMile)).toFixed(2);

    try {
        const order = await models.Order.findByIdAndUpdate(orderId, {
            ...req.body.order,
            price,
            distance: distance.toFixed(2)
        }, { new: true });

        if (order === null) {
            res.status(400).send({
                status: 'fail',
                message: `An order with with orderId: ${orderId} does not exists`
            });
        }

        res.status(200).send({
            status: 'success',
            order,
            message: 'Order updated successfully!'
        });
    } catch (e) {
        res.status(500).send({
            status: 'fail',
            message: 'Order could not be updated!',
        });
    }
});

// CREATE an order
router.post('/', async (req, res, next) => {
    const {
        service,
        customer_name,
        notes,
        customer_address,
        our_address,
        bins,
        cases,
        Vflats,
        additional,
        date_time
    } = req.body.order;
    const { pricing } = settings;

    const pBins = pricing.bins[Number(bins.type)] * bins.quantity;
    const pCases = pricing.cases[Number(cases.type)] * cases.quantity;
    const pVflats = pricing.Vflats[Number(Vflats.type)] * Vflats.quantity;
    const pAdditional = pricing.additional_fees[Number(additional.type)] * additional.quantity;

    const basePrice = pBins + pCases + pVflats + pAdditional;

    let distance;

    try {
        const distances = await googleMapsClient.distanceMatrix({
            origins: [our_address],
            destinations: [customer_address],
            units: 'imperial',
        }).asPromise();
        distance = convert(distances.json.rows[0].elements[0].distance.value)
            .from('m').to('mi');
    } catch (e) {
        return res.status(500).send({
            status: 'fail',
            message: 'internal server error'
        })
    }
    const price = (basePrice + (distance * settings.pricePerMile)).toFixed(2);

    try {
        const newOrder = await models.Order.create({
            customer_id: "5b879b9bf608ece831231182",
            customer_name,
            customer_address,
            our_address,
            notes,
            distance: distance.toFixed(2),
            date_time,
            bins,
            cases,
            Vflats,
            additional,
            price,
            service
        });
        res.send({
            status: 'success',
            order: newOrder,
            message: "Order created successfully!"
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({
            status: "fail",
            message: 'Order could not be created, try again!'
        })
    }
});

// GET all orders
router.get('/', async (req, res) => {
    try {
        const orders = await models.Order.find();
        res.status(200).send({
            status: 'success',
            orders
        })
    } catch (e) {
        res.status(500).send({
            status: 'fail',
            message: 'Could not get all orders'
        })
    }

});

// CONFIRM an order
router.put('/:orderId/confirm', async (req, res, next) => {
    const { orderId } = req.params;
    const { email } = req.body;
    const { EMAIL_ADDR,SENDGRID_API_KEY, EMAIL_FROM } = process.env;

    // EMAIL TRANSPORT
    let transporter = nodemailer.createTransport(
        sgTransport({
            auth: {
                
                api_key: SENDGRID_API_KEY
            }
        })
    )
    

    if (!email) {
        return res.status(403).send({
            message: 'Recipient email is required',
            status: 'fail'
        })
    }

    try {
        const order = await models.Order.findById(orderId);

        if (order === null) {
            throw new Error(`An order with with orderId: ${orderId} does not exists`);
        }

       
        const packages = {
            bins: ['One bin($30)', 'Two Bins($40)', 'Three Bins and over Truck jobs($130/hr)'],
            cases: ['One Case($35)', 'Two Cases($40)', 'Three Cases($50)'],
            Vflats: ['VFlats, magliners, bead boards, flags($5)', 'Anything too long($5)'],
            additional: ['Rush NYC($15)', 'Rush BK($25)', 'Super Rush NYC($30)', 'Super Rush BK($40)', 'No pick up fee($12)', 'Waiting time per hr($40)']
        };

        const { pricing } = settings;

        const pBins = pricing.bins[Number(order.bins.type)] * order.bins.quantity;
        const pCases = pricing.cases[Number(order.cases.type)] * order.cases.quantity;
        const pVflats = pricing.Vflats[Number(order.Vflats.type)] * order.Vflats.quantity;
        const pAdditional = pricing.additional_fees[Number(order.additional.type)] * order.additional.quantity;

        let orderSummary;
        let myObj = [
            { label: 'bins', price: pBins },
            { label: 'cases', price: pCases },
            { label: 'Vflats', price: pVflats },
            { label: 'additional', price: pAdditional },
        ].filter((item) => item.price != 0)

        orderSummary = myObj.map(({ label, price}) => {
            return `${label}: ${packages[label][order[label].type]} – QTY: ${order[label].quantity} – PRICE: $${price}`
        }).join('\t\n')
        

        let mailOptions = {
            from: `"${EMAIL_FROM}" <${EMAIL_ADDR}>`,
            to: email,
            subject: 'Order Confirmed',
            text: `
                Order Confirmed
                
                Dear ${order.customer_name},
                Order reference number is: ${order._id}
                Your order has been confirmed. Please find below the order summary.
                
                Price: $${order.price}
                Your Address: ${order.customer_address}
                Our Address: ${order.our_address}
                Service: ${order.service}
                    
                Packages:
                ${orderSummary}
                mileage cost: ${(order.distance * settings.pricePerMile).toFixed(2)}
            `,
        };

        
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                    console.log(error)
                return res.status(500).send({
                    message: `Confirmation email could not be sent! order not confirmed`,
                    status: 'fail'
                });
            } else {
                try {
                    const order = await models.Order.findByIdAndUpdate(orderId, {
                        confirmed: true,
                    }, { new: true });

                    res.status(200).send({
                        status: 'success',
                        order,
                        message: 'Order confirmed successfully, email sent!'
                    });
                } catch (e) {
                    res.status(500).send({
                        status: 'fail',
                        message: 'Confirmation email sent but the order could not be updated',
                    });
                }
            }
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({
            message: `An order with with orderId: ${orderId} does not exists`,
            status: 'fail'
        });
    }
});

module.exports = router;
