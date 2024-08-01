const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.signedCookies.token;

        if (!token) {
            throw new CustomError.UnauthenticatedError('Authentication Invalid');
        }

        const { name, userId, role } = isTokenValid({ token });
        req.user = { name, userId, role };
        next();
    } catch (error) {
        next(error)
    }
}

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        try {
            if (!roles.includes(req.user.role)) {
                throw new CustomError.UnauthorizedError(
                    'Unauthorized to access this route')
            }
            next()
        } catch (err) {
            next(err);
        }
    }
}



module.exports = { authenticateUser, authorizePermissions }