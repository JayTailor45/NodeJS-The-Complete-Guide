const express = require('express');
const User = require('../models/user');
const {body} = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .normalizeEmail(),
    body('password')
        .isLength({min: 5, max: 15})
        .isAlphanumeric()
        .trim(),
], authController.postLogin);
router.get('/signup', authController.getSignup);
router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .custom((val, {req}) => {
            return User.findOne({email: val})
                .then(user => {
                    if (user) {
                        return Promise.reject('User with this email already exist!');
                    }
                });
        })
        .normalizeEmail(),
    body('password')
        .isLength({min: 5, max: 15})
        .isAlphanumeric()
        .trim(),
], authController.postSignup);
router.post('/logout', authController.postLogout);

module.exports = router;
