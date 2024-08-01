const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse } = require('../utils')


const register = async (req, res, next) => {
    try {
        const { email, name, password } = req.body;
        const emailAlreadyExists = await User.findOne({ email });

        if (emailAlreadyExists) {
            throw new CustomError.BadRequestError('Email already exists');
        }

        //first registered user is an admin
        const isFisrtAccount = (await User.countDocuments({})) === 0
        const role = isFisrtAccount ? 'admin' : 'user'

        const user = await User.create({ name, email, password, role });

        const tokenUser = { name: user.name, userId: user._id, role: user.role }
        attachCookiesToResponse({ res, user: tokenUser })

        res.status(StatusCodes.CREATED).json({ user: tokenUser });
    } catch (error) {
        next(error); // Sử dụng next để truyền lỗi tới middleware xử lý lỗi
    }
};
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new CustomError.BadRequestError('Please provide email and password');
        }
        const user = await User.findOne({ email });

        if (!user) {
            throw new CustomError.UnauthenticatedError('Invalid Credentials');
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            throw new CustomError.UnauthenticatedError('Invalid Credentials');
        }

        const tokenUser = { name: user.name, userId: user._id, role: user.role }
        attachCookiesToResponse({ res, user: tokenUser })

        res.status(StatusCodes.OK).json({ user: tokenUser });
    } catch (error) {
        next(error)
    }
}
const logout = async (req, res, next) => {
    try {
        res.cookie('token', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now()),
        })

        res.status(StatusCodes.OK).json({ msg: "User logged out!" });
    } catch (error) {
        next(error)
    }

}
module.exports = {
    register,
    login,
    logout,
};