const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const {dbConfig} = require('./app.config');

const errorController = require('./controllers/error');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('5fe103a928464b18c4ebf47c')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(console.error);
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(dbConfig.connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(res => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Jay',
                    email: 'tailorj64@gmail.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch(console.error);
