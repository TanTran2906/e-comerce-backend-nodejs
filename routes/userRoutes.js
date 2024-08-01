const express = require('express');
const router = express.Router();

const { getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser, updateUserPassword } = require('../controllers/userController');
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

//Middleware này chạy trước tất cả các route bên dưới
router.use(authenticateUser, authorizePermissions('admin'))

router.route('/').get(getAllUsers);

router.route('/showMe').get(showCurrentUser);
router.route('/updateUser').post(updateUser);
router.route('/updateUserPassword').post(updateUserPassword);

router.route('/:id').get(getSingleUser)

module.exports = router;