const express = require('express');
const {body} = require('express-validator/check');

const isAuth = require('../middlewares/isAuth');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', [
    body('title')
        .isString()
        .isLength({min: 3})
        .trim(),
    body('price')
        .isFloat(),
    body('description')
        .isLength({min: 5, max: 200})
        .trim(),
], isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
    body('title')
        .isAlphanumeric()
        .isLength({min: 3})
        .trim(),
    body('price')
        .isFloat(),
    body('description')
        .isLength({min: 5, max: 200})
        .trim(),
], isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
