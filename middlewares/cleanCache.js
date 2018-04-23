const {clearHash} = require ('../services/cache');

module.exports = async (req, res, next) => {
    await next();                                           // 1
    clearHash(req.user.id);
};

// 1 -  forces the middleware to run after the request has been sent