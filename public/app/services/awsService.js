angular.module('awsService', [])
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('xmlHttpInterceptor');
  })

.factory('AWS', function($http,Applicant,Upload,$rootScope, $q){
	var aws = [];
	var upload = [];
	var updateID; //has to be global function

    aws.uploadAppMedias = function(data,requirements,appID,bucket){ 
    //Note: ID is undefine.
        var uploadFiles = data;
            updateID = appID;
        //remove empty files

        var numFiles = 0;
        var numFilesDone = 0;
        for (var i in uploadFiles) {
          /*var  i = 1; //temp fix for loop above*/
          numFiles++;
          var file = uploadFiles[i];
          /*file.progress = parseInt(0);*/
          if(file)
            (function (file, i) {
              $http.get('/s3Policy?mimeType='+ file.type)
                .success(function(response) {
                  var s3Params = response;
                  upload[i] = Upload.upload({
                    url: 'https://' + bucket + '.s3.amazonaws.com/',
                    method: 'POST',
                    transformRequest: function (data, headersGetter) {
                      //Headers change here
                      var headers = headersGetter();
                      delete headers['Authorization'];
                      return data;
                    },
                    data: {
                      'key' : 'upload/'+ Math.round(Math.random()*10000) + '$$' + file.name,
                      'acl' : 'public-read',
                      'Content-Type' : file.type,
                      'AWSAccessKeyId': s3Params.AWSAccessKeyId,
                      'success_action_status' : '201',
                      'Policy' : s3Params.s3Policy,
                      'Signature' : s3Params.s3Signature
                    },
                    file: file,
                  });
                  upload[i]
                    .then(function(response) {
                      file.progress = parseInt(100);
                      /*console.log(response);*/
                      if (response.status === 201) {
                        var data = response.data, parsedData;
                        parsedData = {
                          location: data.PostResponse.Location,
                          bucket: data.PostResponse.Bucket,
                          key: data.PostResponse.Key,
                          etag: data.PostResponse.ETag,
                          name: requirements[i],
                          file_type: file.type
                        };
                        Applicant.update(updateID,parsedData);

                      } else {
                        alert('Upload Failed, please resubmit your application.');
                      }
                    }, null, function(evt) {
                      file.progress =  parseInt(100.0 * evt.loaded / evt.total);
                      if(file.progress == 100){
                        numFilesDone++;
                        if(numFilesDone == numFiles) //hack,because resp 4 times
                        {   /*vm.busy = false;*/
                          /*return true;*/
                          //send event to main
                          /*console.log("Finished uploading files")*/
                          $rootScope.$emit('app-media-submitted')
                        }
                      }

                    });
                });
            }(file, i));
        }
      };

  aws.uploadCP = function(data,bucket, callback){
    /*console.log(data.file)
    console.log(bucket)*/
    var deferred = $q.defer();

      /*console.log('AppID ' + appID);*/
    //Note: ID is undefine.
        var uploadFiles = [];
        uploadFiles.push(data.file);
            
        //remove empty files

        var numFiles = 0;
        var numFilesDone = 0;
        for (var i in uploadFiles) {
          /*var  i = 1; //temp fix for loop above*/
          numFiles++;
          var file = uploadFiles[i];
          /*file.progress = parseInt(0);*/
          if(file)
            (function (file, i) {
              $http.get('/s3Policy?mimeType='+ file.type)
                .success(function(response) {
                  var s3Params = response;
                  upload[i] = Upload.upload({
                    url: 'https://' + bucket + '.s3.amazonaws.com/',
                    method: 'POST',
                    transformRequest: function (data, headersGetter) {
                      //Headers change here
                      var headers = headersGetter();
                      delete headers['Authorization'];
                      return data;
                    },
                    data: {
                      'key' : 'upload/'+ Math.round(Math.random()*10000) + '$$' + file.name,
                      'acl' : 'public-read',
                      'Content-Type' : file.type,
                      'AWSAccessKeyId': s3Params.AWSAccessKeyId,
                      'success_action_status' : '201',
                      'Policy' : s3Params.s3Policy,
                      'Signature' : s3Params.s3Signature
                    },
                    file: file,
                  });
                  upload[i]
                    .then(function(response) {
                      /*console.log(response);*/
                      file.progress = parseInt(100);
                      /*console.log(response);*/
                      if (response.status === 201) {
                        var data = response.data, parsedData;
                        parsedData = {
                          source: data.PostResponse.Location,
                          bucket: data.PostResponse.Bucket,
                          key: data.PostResponse.Key,
                          etag: data.PostResponse.ETag,
                          name:  file.name,
                          file_type: file.type
                        };
                        callback(parsedData);
                      } else {
                        reject(alert('Upload Failed, please resubmit your application.') );
                      }
                    }, null, function(evt) {
                      file.progress =  parseInt(100.0 * evt.loaded / evt.total);
                      if(file.progress == 100){
                        numFilesDone++;
                        if(numFilesDone == numFiles) //hack,because resp 4 times
                        {
                          console.log("Finished uploading files")
                        }
                      }

                    });
                });
            }(file, i));
      }
      }
      return aws;
});
