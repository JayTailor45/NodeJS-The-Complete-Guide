const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator/check');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: '',
    });
};

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg
        });
    }
    User.findOne({email})
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save((err) => {
                            res.redirect('/');
                        });
                    }
                    return res.render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: ''
                    });
                })
                .catch(err => {
                    return res.render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Something Went wrong!'
                    });
                })
        })
        .catch(err => {
            const error = new Error('Something went wrong!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'SignUp',
    });
};

exports.postSignup = (req, res, next) => {
    const {email, password} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg
        });
    }
    return bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const newUser = new User({email, password: hashedPassword, cart: {items: []}});
            return newUser.save();
        })
        .then(result => {
            return res.render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: ''
            });
        })
        .catch(err => {
            const error = new Error('Something went wrong while creating a new user!');
            error.httpStatusCode = 500;
            next(error);
        });
};
