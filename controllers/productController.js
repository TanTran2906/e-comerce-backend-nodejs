const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const CustomError = require("../errors");
const path = require('path')


const createProduct = async (req, res, next) => {
    try {
        req.body.user = req.user.userId;
        const product = await Product.create(req.body);
        res.status(StatusCodes.CREATED).json({ product });
    } catch (error) {
        next(error)
    }
};
const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find({})
        res.status(StatusCodes.OK).json({ products, count: products.length })
    } catch (error) {
        next(error)
    }
};
const getSingleProduct = async (req, res, next) => {
    try {
        const { id: productId } = req.params;

        const product = await Product.findOne({ _id: productId }).populate('reviews');

        if (!product) {
            throw new CustomError.NotFoundError(`No product with id : ${productId}`)
        }
        res.status(StatusCodes.OK).json({ product });
    } catch (error) {
        next(error)
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id: productId } = req.params;

        const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            throw new CustomError.NotFoundError(`No product with id : ${productId}`)
        };

        res.status(StatusCodes.OK).json({ product })
    } catch (error) {
        next(error)
    }

}
const deleteProduct = async (req, res, next) => {
    try {
        const { id: productId } = req.params;

        const product = await Product.findOne({ _id: productId });

        if (!product) {
            throw new CustomError.NotFoundError(`No product with id : ${productId}`)
        };

        await product.remove()
        res.status(StatusCodes.OK).json({ msg: "Success! Product removed." })
    } catch (error) {
        next(error)
    }
}
const uploadImage = async (req, res, next) => {
    try {
        // console.log(req.files)
        // res.send("Upload")
        if (!req.files) {
            throw new CustomError.BadRequestError('No File Upload')
        }

        const productImage = req.files.image
        if (!productImage.mimetype.startsWith('image')) {
            throw new CustomError.BadRequestError('Please upload image')
        }

        // const maxSize = 1024 * 1024
        // if (productImage.size > maxSize) {
        //     throw new CustomError.BadRequestError('Please upload image smaller than 1MB')
        // }

        const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`)

        await productImage.mv(imagePath)
        res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` })

    } catch (error) {
        next(error)
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}