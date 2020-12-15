const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    });
};

exports.postAddProduct = (req, res, next) => {
    const {title, imageUrl, price, description} = req.body;
    req.user.createProduct({title, imageUrl, price, description})
        .then(_ => {
            console.log(`Product created!`);
            res.redirect('/admin/products');
        })
        .catch(console.error);
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const {productId} = req.params;
    req.user.getProducts({where: {id: productId}})
        .then(products => {
            const product = products[0];
            if (!products) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        });
};

exports.postEditProduct = (req, res, next) => {
    const {productId, title, price, imageUrl, description} = req.body;
    const updatedTitle = title;
    const updatedPrice = price;
    const updatedImageUrl = imageUrl;
    const updatedDescription = description;
    Product.findByPk(productId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            return product.save();
        })
        .then(_ => {
            console.log(`Product updated!`);
            res.redirect('/admin/products');
        })
        .catch(console.error);
};

exports.postDeleteProduct = (req, res, next) => {
    const {productId} = req.body;
    Product.findByPk(productId)
        .then(product => {
            return product.destroy();
        })
        .then(_ => {
            console.log(`Product deleted!`);
            res.redirect('/admin/products');
        })
        .catch(console.error);
};

exports.getProducts = (req, res, next) => {
    req.user.getProducts()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(console.error);
};
