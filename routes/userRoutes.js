const express = require('express');
const userController = require('./../controllers/userController');


const router = express.Router();

/** If we don't specify id, then we want to get all the objects of one resource
 *  it's already been specified that userRouter only deals with '/api/v1/users'
    in app.js, so here we detail which URLs within /users we're responding to
 */

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;