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
    const product = new Product({title, price, description, imageUrl, userId: req.user});
    product.save()
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
    Product.findById(productId)
        .then(product => {
            if (!product) {
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
    const updatedDescription = description;
    const updatedImageUrl = imageUrl;
    Product.findById(productId)
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
    Product.findByIdAndRemove(productId)
        .then(_ => {
            console.log(`Product deleted!`);
            res.redirect('/admin/products');
        })
        .catch(console.error);
};

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(console.error);
};
