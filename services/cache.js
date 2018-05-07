var mongoose = require("mongoose");
const redis = require('redis');
const util = require('util');
const keys = require('./../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);                // 0

const exec = mongoose.Query.prototype.exec;             // 1

mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;                                        // 2
}

mongoose.Query.prototype.exec = async function() {

    if (!this.useCache) return exec.apply(this, arguments);     //

    const key = JSON.stringify(
        Object.assign(
            {},
            this.getQuery(),
            {collection: this.mongooseCollection.name}
        )
    );

    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }


    const result = await exec.apply(this, arguments);   // 3
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}

// 0 -  client.get normally triggers a callback,
//      so promisify makes it return a promise
// 1 -  the original exec function
// 2 -  so that .cache is chainable
//  -   if .cache is not used in the route, run Query.exec as usual
// 3 -  result is a Mongoose model instance