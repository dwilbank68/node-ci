// const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
// const cleanCache = require('../middlewares/cleanCache');
//
// const Blog = mongoose.model('Blog');
const keys = require('../config/keys');

const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey,
    region: 'us-west-1'
});

module.exports = app => {

  app.get(
      '/api/upload',
      requireLogin,
      // cleanCache,
      (req, res) => {
          const key = `${req.user.id}/${uuid()}.jpeg`;                      // 4
          const paramsObj = {
              Bucket: 'grider-advanced-node',
              Key: key,
              ContentType: 'image/jpeg'
          }
          s3.getSignedUrl('putObject', paramsObj, (err, url) => {
              res.send({key, url});
          });

      }
  );
};

// 4 -  unique name for the file to be uploaded