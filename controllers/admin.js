const Product = require('../models/product');
const fileUtil = require('../util/file');
const {validationResult} = require('express-validator/check');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
    });
};

exports.postAddProduct = (req, res, next) => {
    const {title, price, description} = req.body;
    const image = req.file;
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: false,
            product: {title, price, description},
            hasError: true,
            errorMessage: 'Image is not valid!',
        });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: false,
            product: {title, price, description},
            hasError: true,
            errorMessage: errors.array()[0].msg,
        });
    }
    const imageUrl = image.path.replace("\\", "/");
    const product = new Product({title, price, description, imageUrl, userId: req.user});
    product.save()
        .then(_ => {
            console.log(`Product created!`);
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error('Product creation failed!');
            error.httpStatusCode = 500;
            next(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const {productId} = req.params;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
            });
        });
};

exports.postEditProduct = (req, res, next) => {
    const {productId, title, price, description} = req.body;
    const updatedTitle = title;
    const updatedPrice = price;
    const updatedDescription = description;
    const image = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: false,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: productId,
            },
            hasError: true,
            errorMessage: errors.array()[0].msg,
        });
    }
    Product.findById(productId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            if (image) {
                fileUtil.deleteFile(product.imageUrl);
                product.imageUrl = image.path.replace("\\", "/");
            }
            return product.save();
        })
        .then(_ => {
            console.log(`Product updated!`);
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error('Unable to update the data!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const {productId} = req.body;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                next(new Error('Product not found!'));
            }
            fileUtil.deleteFile(product.imageUrl);
            return Product.findByIdAndRemove(productId);
        })
        .then(_ => {
            console.log(`Product deleted!`);
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error('Something went wrong while deleting a product!');
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
            });
        })
        .catch(err => {
            const error = new Error('Unable to fetch products!');
            error.httpStatusCode = 500;
            next(error);
        });
};
