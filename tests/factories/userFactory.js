const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
    return new User({}).save();
};

//        Jest does not run index.js (which would run mongoose.connect(...))
// 2 -  Mongoose user._id is an object - must be stringified