const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

User.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString());
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({productId: product._id, quantity: newQuantity})
    }
    const updatedCart = {items: updatedCartItems};
    this.cart = updatedCart;
    return this.save();
};

User.methods.deleteItemFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(i => i.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
};

User.methods.clearCart = function () {
    this.cart = {items: []};
    return this.save();
};

module.exports = mongoose.model('User', User);
