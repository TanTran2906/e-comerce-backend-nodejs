const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils");

const getAllUsers = async (req, res) => {
    const users = await User.find({ role: "user" }).select("-password")
    res.status(StatusCodes.OK).json({ users })
}
const getSingleUser = async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await User.findOne({ _id: id }).select("-password")
        if (!user) {
            throw new CustomError.NotFoundError(`No user with id: ${id}`)
        }
        res.status(StatusCodes.OK).json({ user })
    } catch (err) {
        next(err)
    }
}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res, next) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            throw new CustomError.BadRequestError('Please provide all values');
        }
        const user = await User.findOne(
            { _id: req.user.userId },
        );

        user.email = email
        user.name = name

        await user.save()

        const tokenUser = { name: user.name, userId: user._id, role: user.role }
        attachCookiesToResponse({ res, user: tokenUser })
        res.status(StatusCodes.OK).json({ user: tokenUser })

    } catch (error) {
        next(error)
    }
}

const updateUserPassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            throw new CustomError.BadRequestError('Please provide both values');
        }
        const user = await User.findOne({ _id: req.user.userId });

        const isPasswordCorrect = await user.comparePassword(oldPassword);
        if (!isPasswordCorrect) {
            throw new CustomError.UnauthenticatedError('Invalid Credentials');
        }
        user.password = newPassword;

        await user.save();
        res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
    }
    catch (err) {
        next(err)
    }
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser, updateUserPassword
}

