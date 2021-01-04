const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/orders');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments()
        .then(numberOfProducts => {
            totalItems = numberOfProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments()
        .then(numberOfProducts => {
            totalItems = numberOfProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })

        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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


exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('Order not found!'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized!'));
            }
            const invoiceName = `invoice-${orderId}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(16).text('Invoice', {underline: true});
            pdfDoc.fontSize(14).text('-'.repeat(16));
            let total = 0;
            order.products.forEach(prod => {
                total += prod.quantity * prod.quantity;
                pdfDoc.text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
            });
            pdfDoc.fontSize(14).text('-'.repeat(16));
            pdfDoc.fontSize(20).text(`Total Price: $${total}`);
            pdfDoc.end();
            /*fs.readFile(invoicePath, (err, data) => {
                if (err) {
                    return next(err);
                }
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
                res.send(data);
            });*/
            // const file = fs.createReadStream(invoicePath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
            // file.pipe(res);
        })
        .catch(err => next(err));
};
