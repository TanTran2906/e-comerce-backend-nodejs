const Product = require("../models/Product");
const CustomError = require("../errors");
const Review = require("../models/Review");
const { StatusCodes } = require("http-status-codes");


const createReview = async (req, res, next) => {
    try {
        const { product: productId } = req.body;

        const isValidProduct = await Product.findOne({ _id: productId });

        if (!isValidProduct) {
            throw new CustomError.NotFoundError(`No product with id : ${productId} `);
        }

        const alreadySubmitted = await Review.findOne({
            product: productId,
            user: req.user.userId,
        })
        if (alreadySubmitted) {
            throw new CustomError.BadRequestError(
                'Already submitted review for this product')
        }

        req.body.user = req.user.userId;
        const review = await Review.create(req.body);
        res.status(StatusCodes.CREATED).json({ review });

    } catch (error) {
        next(error)
    }
}
const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({})
            .populate({
                path: 'product',
                select: 'name company price'
            })
        res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
    } catch (error) {
        next(error)
    }
}

const getSingleReview = async (req, res, next) => {
    try {
        const { id: reviewId } = req.params;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
        }

        res.status(StatusCodes.OK).json({ review });
    } catch (error) {
        next(error)
    }
}

const updateReview = async (req, res, next) => {
    try {
        const { id: reviewId } = req.params;
        const { rating, title, comment } = req.body;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            throw new CustomError.NotFoundError(`No review with id ${reviewId} `);

        }

        review.rating = rating;
        review.title = title;
        review.comment = comment;

        await review.save();
        res.status(StatusCodes.OK).json({ review });

    } catch (error) {
        next(error)
    }
}

const deleteReview = async (req, res, next) => {
    try {
        const { id: reviewId } = req.params;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
        }

        await review.remove()
        res.status(StatusCodes.OK).json({ msg: "Success!Review removed" });

    } catch (error) {
        next(error)
    }
}

const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params;
    const reviews = await Review.find({ product: productId });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview, updateReview, deleteReview, getSingleProductReviews
}