'use strict';

var AWS = require('aws-sdk'),
    crypto = require('crypto'),
    config = require('../aws.json'),
    createS3Policy,
    getExpiryTime,
    s3DeleteObject,
    s3 = new AWS.S3();
/*s3.listBuckets(function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
*/

getExpiryTime = function () {
    var _date = new Date();
    return '' + (_date.getFullYear()) + '-' + (_date.getMonth() + 1) + '-' +
        (_date.getDate() + 1) + 'T' + (_date.getHours() + 3) + ':' + '00:00.000Z';
};

s3DeleteObject = function (object) {
    var params = {
        Bucket: config.bucket, /* required */
        Key: object /* required */
    };
    s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
    return;
}

createS3Policy = function (contentType, callback) {
    var date = new Date();
    var s3Policy = {
        'expiration': getExpiryTime(),
        'conditions': [
            ['starts-with', '$key', 'upload/'],
            {'bucket': config.bucket},
            {'acl': 'public-read'},
            ['starts-with', '$Content-Type', contentType],
            {'success_action_status': '201'}
        ]
    };

    // stringify and encode the policy
    var stringPolicy = JSON.stringify(s3Policy);
    var base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

    // sign the base64 encoded policy
    var signature = crypto.createHmac('sha1', config.secretAccessKey)
        .update(new Buffer(base64Policy, 'utf-8')).digest('base64');

    // build the results object
    var s3Credentials = {
        s3Policy: base64Policy,
        s3Signature: signature,
        AWSAccessKeyId: config.accessKeyId
    };

    // send it back
    callback(s3Credentials);
};

exports.removeSup = function (sup) {
    var objects = [];
    console.log("deleting from S3")
    for (var i in sup) {
        /*console.log(i);*/
        objects.push({
            Key: sup[i].key
        })
    }
    var params = {
        Bucket: config.bucket, /* required */
        Delete: {
            /* required */
            Objects: objects,
            Quiet: true
        }
    };
    if (objects.length == sup.length)
        s3.deleteObjects(params, function (err, data) {
            /*console.log(data)*/
            if (err) {
                console.log(err, err.stack);
                return;
             }// an error occurred
            else     {
                console.log("successfully removed");
                return
            }           // successful response
        });
}

exports.removeCP = function (key) {
    var object = ({"Key":key})
    var params = {
        Bucket: config.bucket, /* required */
        Delete: {
            /* required */
            Objects: object,
            Quiet: true
        }
    };    
    s3.deleteObjects(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log("successful removed from s3");           // successful response
    });
}

exports.getS3Policy = function (req, res) {
    createS3Policy(req.query.mimeType, function (creds, err) {
        if (!err) {
            return res.send(200, creds);
        } else {
            return res.send(500, err);
        }
    });
};