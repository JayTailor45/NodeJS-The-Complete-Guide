const Product = require('../models/product');
const Order = require('../models/orders');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
            });
        })
        .catch(err => {
            const error = new Error('Unable to fetch data!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: user.cart.items,
            });
        })
        .catch(err => {
            const error = new Error('Unable to fetch cart data!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            const error = new Error('Unable to fetch data!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(_ => {
            res.redirect('/cart');
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.prodId;
    req.user.deleteItemFromCart(prodId)
        .then(_ => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error('Something went wrong while deleting the product from the cart!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders,
            });
        })
        .catch(err => {
            const error = new Error('Unable to fetch order data!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
    });
};

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return {
                    quantity: i.quantity,
                    product: {...i.productId._doc}
                };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(_ => {
            return req.user.clearCart();
        })
        .then(_ => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error('Something went wrong while saving order!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            console.log(product);
            res.render('shop/product-detail', {
                product: product, pageTitle: product.title, path: '/products'
            });
        })
        .catch(err => {
            const error = new Error('Unable to fetch products!');
            error.httpStatusCode = 500;
            next(error);
        });
};
