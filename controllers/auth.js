const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
    });
};

exports.postLogin = (req, res, next) => {
    const {email, password} = req.body;
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
                    res.redirect('/login');
                })
                .catch(err => {
                    console.error(err);
                    res.redirect('/login');
                });
        }).catch(console.error);
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
    User.findOne({email})
        .then(user => {
            if (!user) {
                return bcrypt.hash(password, 12);
            }
        })
        .then(hashedPassword => {
            const newUser = new User({email, password: hashedPassword, cart: {items: []}});
            return newUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(console.error);
};
