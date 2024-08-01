const Order = require('../models/Order');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const Product = require('../models/Product');

const getAllOrders = async (req, res, next) => {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
        }
        res.status(StatusCodes.OK).json({ order });
    } catch (error) {
        next(error)
    }
};

const getCurrentUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.userId });
        res.status(StatusCodes.OK).json({ orders });
    } catch (error) {
        next(error)
    }
};

const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'someRandomValue';
    return { client_secret, amount };

}

const createOrder = async (req, res, next) => {
    try {
        const { tax, shippingFee, items: cartItems } = req.body;

        if (!cartItems || cartItems.length < 1) {
            throw new CustomError.BadRequestError('No cart items provided');
        }
        if (!tax || !shippingFee) {
            throw new CustomError.BadRequestError('Please provide tax and shipping fee');
        }

        let orderItems = [];
        let subtotal = 0;

        for (const item of cartItems) {
            const dbProduct = await Product.findOne({ _id: item.product });
            if (!dbProduct) {
                throw new CustomError.NotFoundError(`No product with id : ${item.product}`)
            }

            const { name, price, image, _id } = dbProduct

            const singleOrderItem = {
                amount: item.amount,
                name,
                price,
                image,
                product: _id,
            }
            // add item to order
            orderItems = [...orderItems, singleOrderItem]
            subtotal += item.amount * price
        }
        // calculate total
        const total = tax + shippingFee + subtotal;
        // get client secret
        const paymentIntent = await fakeStripeAPI({
            amount: total,
            currency: 'usd',
        })
        const order = await Order.create({
            orderItems,
            total,
            subtotal,
            tax,
            shippingFee,
            clientSecret: paymentIntent.client_secret,
            user: req.user.userId,
        })

        res
            .status(StatusCodes.CREATED)
            .json({ order, clientSecret: order.client_secret });

        // res.status(StatusCodes.CREATED).json({ order });
    } catch (error) {
        next(error)
    }
};

const updateOrder = async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const { paymentIntent } = req.body;

        const order = await Order.findOne({ _id: orderId });
        if (!order) {
            throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
        }

        order.paymentIntent = paymentIntent
        order.status = 'paid';
        await order.save();

        res.status(StatusCodes.OK).json({ order });
    } catch (error) {
        next(error)
    }
};

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
};
