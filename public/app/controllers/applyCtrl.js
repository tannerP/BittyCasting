angular.module('applyCtrl',['userService', 'mgcrea.ngStrap']).
	config(function ($httpProvider) {
            $httpProvider.interceptors.push('xmlHttpInterceptor');
          }).
    controller('applyController',['$scope','$rootScope',
        'Upload','$http', 'Project', 'Role','Applicant',
        '$routeParams',
        function ($scope, $rootScope, Upload, $http, Project, 
            Role, Applicant, $routeParams) {
    //upload later on form submit or something similar
    var vm = this;
    vm.roleData={};
    vm.appData ={};
    vm.files=[];
    Role.appGetRole($routeParams.role_id).then(function(data){
        vm.roleData = data.data.data;
        if(vm.roleData){
        Project.appGetPrj(vm.roleData.projectID).then(function(data){
            vm.prjData = data.data.project;
            vm.appData.projectID = data.data.project._id;
            vm.appData.roleID = vm.roleData._id

        vm.files = vm.roleData.requirements.splice();
        vm.files.forEach(
            function(item,index, requirements){
            vm.files[item].index = index;
        })
        })}
    });
    vm.submit = function() {
      Applicant.apply(vm.appData).then(function(resp){
        vm.applicantID = resp.data.appID;
        vm.appData = "";
        if(vm.roleData){
             uploadFiles(vm.files)    
            $scope.status = "Submitted"
            
        }  
      })
        /*$http.get('/applicant', vm.appData);*/
    };

    /* ----------------- Uploader -------------- */
    $scope.abort = function(index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
    };
    var uploadFiles = function (data) {
            
            vm.upload = [];
            var uploadFiles = data;
            for (var i = 0; i < data.length; i++) {
                /*var  i = 1; //temp fix for loop above*/
                var file = uploadFiles[i];
                console.log(file);
                /*file.progress = parseInt(0);*/
                (function (file, i) {
                    $http.get('/s3Policy?mimeType='+ file.type)
                    .success(function(response) {
                        var s3Params = response;
                        vm.upload[i] = Upload.upload({ 
                            url: 'https://' + $rootScope.awsConfig.bucket + '.s3.amazonaws.com/',
                            method: 'POST',
                            transformRequest: function (data, headersGetter) {
                                //Headers change here
                                var headers = headersGetter();
                                delete headers['Authorization'];
                                return data;
                            },
                            data: {
                                /*'key' : toString(vm.roleData._id) + '/' 
                                + toString(vm.applicantId) + file.name'hey',*/
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
                        vm.upload[i]
                        .then(function(response) {
                            file.progress = parseInt(100);
                            if (response.status === 201) {
                                console.log(response.data);
                                var data = response.data, parsedData;
                                console.log(data);
                                parsedData = {
                                    location: data.PostResponse.Location,
                                    bucket: data.PostResponse.Bucket,
                                    key: data.PostResponse.Key,
                                    etag: data.PostResponse.ETag,
                                    name: vm.roleData.requirements[i].name,
                                    file_type: vm.roleData.requirements[i].file_type
                                };
                                /*vm.imageUploads.update(parsedData);*/
                                console.log(parsedData);
                                Applicant.update(vm.applicantID,parsedData);
                            } else {
                                alert('Upload Failed, please resubmit your application.');
                            }
                        }, null, function(evt) {
                            file.progress =  parseInt(100.0 * evt.loaded / evt.total);
                        });
                    });
                }(file, i));
            }
        };
    
    }]);
