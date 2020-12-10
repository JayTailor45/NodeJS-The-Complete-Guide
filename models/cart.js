const fs = require('fs');
const path = require('path');
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

module.exports = class Cart {
    static addTProduct(id, productPrice) {
        fs.readFile(p, (err, content) => {
            let cart = {
                products: [],
                totalPrice: 0
            };
            if(!err) {
                cart = JSON.parse(content);
                const existingProductIndex = cart.products.findIndex(p => p.id === id);
                const existingProduct = cart.products[existingProductIndex];
                let updatedProduct;
                if(existingProduct) {
                    updatedProduct = {...existingProduct};
                    updatedProduct.qty = updatedProduct.qty + 1;
                    cart.products = [...cart.products];
                    cart.products[existingProductIndex] = updatedProduct;
                } else {
                    updatedProduct = { id: id, qty: 1 };
                    cart.products = [...cart.products, updatedProduct];
                }
                cart.totalPrice = cart.totalPrice + +productPrice;
                fs.writeFile(p, JSON.stringify(cart), err => {
                    console.log(err);
                });

            }
        });
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, content) => {
            if (err) {
                return;
            }
            const updatedCart = {...JSON.parse(content)};
            const product = updatedCart.products.find(prod => prod.id === id);
            if (!product) {
                return;
            }
            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            });
        });
    }

    static getCart(cb) {
        fs.readFile(p, (error, content) => {
           const cart = JSON.parse(content);
           if (error) {
               cb(null);
           } else {
               cb(cart);
           }
        });
    }
};
