const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const csurf = require('csurf');
const MongoDBStore = require('connect-mongodb-session')(session);

const {dbConfig} = require('./app.config');

const errorController = require('./controllers/error');

const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
    uri: dbConfig.connectionString,
    connection: 'sessions'
});
const csrfProtection = csurf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'secret', resave: false, saveUninitialized: false, store: store}));
app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    // res.redirect('/500');
    res.status(500).render('500', {
        pageTitle: 'Something went wrong!', path: '/500'
    });
});

mongoose.connect(dbConfig.connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(res => {
        app.listen(3000);
    })
    .catch(err => {
        const error = new Error('Something went wrong with the DB connection!');
        error.httpStatusCode = 500;
        next(error);
    });
