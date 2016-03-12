angular.module('applyCtrl',['userService', 'mgcrea.ngStrap']).
	config(function ($httpProvider) {
            $httpProvider.interceptors.push('xmlHttpInterceptor');
          }).
    controller('applyController',['$scope','$rootScope',
        'Upload','$http', 'Project', 'Role','Applicant',
        '$routeParams','Pub',
        function ($scope, $rootScope, Upload, $http, Project, 
            Role, Applicant, $routeParams, Pub) 
    {
        $scope.$emit("hideNav");
        var vm = this;
        vm.roleData={};
        vm.appData ={};
        vm.files=[];
        $scope.submitted = false;
        console.log('here');
        console.log($routeParams.id)
        /*TODO: condense when combine project and role schema*/
            Pub.getAppRole($routeParams.id).then(function(data){
            console.log(data.data);
            vm.roleData = data.data.Application;
            console.log(vm.roleData)
            if(vm.roleData){
            Pub.getAppPrj(vm.roleData.projectID).then(function(data){
                vm.prjData = data.data.project;
                vm.appData.projectID = data.data.project._id;
                vm.appData.roleID = vm.roleData._id
                /*vm.files = vm.roleData.requirements.splice();*/
                /*vm.files.forEach(
                function(item,index, requirements){
                vm.files[item].index = index;
            })*/
            })}
        });

        vm.submit = function() {
          Applicant.apply(vm.appData).then(function(resp){
            vm.applicantID = resp.data.appID;
            vm.appData = "";
            if(vm.roleData){
                 uploadFiles(vm.files)    
                $scope.status = "Submitted"
                $scope.submitted = true;        
            }  
          })
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
                                var data = response.data, parsedData;
                                parsedData = {
                                    location: data.PostResponse.Location,
                                    bucket: data.PostResponse.Bucket,
                                    key: data.PostResponse.Key,
                                    etag: data.PostResponse.ETag,
                                    name: vm.roleData.requirements[i].name,
                                    file_type: vm.roleData.requirements[i].file_type
                                };
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
