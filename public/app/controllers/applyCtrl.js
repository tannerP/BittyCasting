angular.module('applyCtrl',['userService', 'mgcrea.ngStrap']).
	controller('applyController',['$scope','$rootScope','Upload','$http', 'Project', 'Role','$routeParams',
        function ($scope, $rootScope, Upload, $http, Project, Role, $routeParams) {
    //upload later on form submit or something similar
    var vm = this;
    vm.roleData={};
    Role.get($routeParams.role_id).then(function(data){
        vm.roleData = data.data.data;
        Project.get(vm.roleData.projectID).then(function(data){
            console.log(data);
            vm.prjData = data.data.data;
        })
    })
    
    console.log(vm.prjData);
    vm.test = function(){
        $http.get('/api/s3Policy?mimeType='+ 'jpeg').
        success(function(response) {
                console.log(response);
    })
    };
    vm.submit = function() {
        console.log("Myctrl submit button pressed");
      if (vm.file) {
        vm.uploadFiles(vm.file)
      }
    };
    // upload on file select or drop
    vm.upload = function (file) {
        console.log("uploading stuff");
        Upload.upload({
            url: 'upload/url',
            data: {file: file, 'username': vm.username}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };
    vm.imageUploads = [];
        vm.abort = function(index) {
            vm.upload[index].abort();
            vm.upload[index] = null;
        };

    vm.uploadFiles = function (data) {
            vm.file = data;
            console.log(vm.files);
            vm.upload = [];
            for (var i = 0; i < 1; i++) {
                var file = vm.file
                file.progress = parseInt(0);
                (function (file, i) {
                    $http.get('/api/s3Policy?mimeType='+ file.type)
                    .success(function(response) {
                        var s3Params = response;
                        vm.upload[i] = Upload.upload({
                            url: 'https://' + $rootScope.config.awsConfig.bucket + '.s3.amazonaws.com/',
                            method: 'POST',
                            transformRequest: function (data, headersGetter) {
                                //Headers change here
                                var headers = headersGetter();
                                delete headers['Authorization'];
                                return data;
                            },
                            data: {
                                'key' : 's3UploadExample/'+ Math.round(Math.random()*10000) + '$$' + file.name,
                                'acl' : 'public-read',
                                'Content-Type' : file.type,
                                'AWSAccessKeyId': s3Params.AWSAccessKeyId,
                                'success_action_status' : '201',
                                'Policy' : s3Params.s3Policy,
                                'Signature' : s3Params.s3Signature
                            },
                            file: file,
                        });
                        vm.upload[i]
                        .then(function(response) {
                            file.progress = parseInt(100);
                            if (response.status === 201) {
                                var data = xml2json.parser(response.data),
                                parsedData;
                                parsedData = {
                                    location: data.postresponse.location,
                                    bucket: data.postresponse.bucket,
                                    key: data.postresponse.key,
                                    etag: data.postresponse.etag
                                };
                                vm.imageUploads.push(parsedData);

                            } else {
                                alert('Upload Failed');
                            }
                        }, null, function(evt) {
                            file.progress =  parseInt(100.0 * evt.loaded / evt.total);
                        });
                    });
                }(file, i));
            }
        };
    
    }]);
