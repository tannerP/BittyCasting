angular.module('applyCtrl',['userService', 'mgcrea.ngStrap']).
  config(function ($httpProvider) {
    $httpProvider.interceptors.push('xmlHttpInterceptor');
  }).
  controller('ApplyController',['$scope','$rootScope',
    'Upload','$http', 'Project', 'Role','Applicant',
    '$routeParams','Pub','$location','$timeout',
    function ($scope, $rootScope, Upload, $http, Project,
              Role, Applicant, $routeParams, Pub, $location,$timeout)
    {
      $scope.$emit("hideNav");
      var vm = this;
      vm.checkFile = function(file){
        console.log(file)
      }
      vm.roleData={};
      vm.appData ={};
      vm.appData.links=[];
      vm.files=[];
      
      $scope.submitted = false;
      /*TODO: condense when combine project and role schema*/
      Pub.getAppRole($routeParams.id).then(function(data){
        vm.roleData = data.data.Application;
        if(vm.roleData){
          Pub.getAppPrj(vm.roleData.projectID).then(function(data){
            vm.prjData = data.data.project;
            vm.appData.projectID = data.data.project._id;
            vm.appData.roleID = vm.roleData._id;
          })}
        //clean requirements
        for(var i in vm.roleData.requirements){
          if(!vm.roleData.requirements[i].selected){
            vm.roleData.requirements.splice(i, ++i);
          }
          if(vm.roleData.requirements[i].format == "Link")
          {
            vm.appData.links.push(vm.roleData.requirements[i]);
            vm.roleData.requirements.splice(i, ++i);
          }
       }        

      });

      //sort out links vs docs/video/images

      vm.links =""
      vm.newLinks= [];
      vm.addLink = function(index,name){
        var link = {};
        /*console.log(link)*/
        console.log(vm.newLinks[index])
        console.log(vm.newLinks)
        console.log(name)
        link.name = name; link.source = vm.newLinks[index];
        vm.newLinks[index] = "";
        console.log(link)

        vm.appData.links.push(link)
        vm.newLink = ""
      }
      vm.removeLink = function (index) {
        console.log("button Press");
        console.log(index)
      if (vm.appData.links.length > 1) {
        if (index === 0) vm.appData.links.shift();
        else vm.appData.links.splice(index, index);

      }
      else if (vm.appData.links.length == 1) {
        vm.appData.links = []
      }
    }

      vm.submit = function() {
        /*setTimeout(function(){ vm.busy = false;alert("Hello"); }, 3000);*/

        custValidate = function (){
          //require fiels are fname lname email
          vm.appData.name={};
          vm.appData.name.first = "", vm.appData.name.last = "";
          vm.appData.name.first.error = true;
          vm.appData.name.last.error = true;
          vm.appData.email.error = true;
          if(vm.appData.name.first){
            vm.appData.name.first.error = false;
            return false
          }
          if(vm.appData.name.last){
            vm.appData.name.first.error = false;
            return false
          }
          if(vm.appData.email){
            vm.appData.name.first.error = false;
            return false
          }
          return true;

        }
        /*if( custValidate() ){ */
        /*  vm.busy = true;
         vm.currfile;
         vm.busy = true;
         uploadFiles(vm.files)*/
        /*}*/

        vm.busy = true;
        vm.currfile;
        vm.busy = true;
        Applicant.apply(vm.appData).then(function(resp){
          vm.applicantID = resp.data.appID;
          vm.appData = "";
          if(vm.roleData){
            console.log("role data" + vm.roleData);
            console.log("file length" + vm.files.length);
            if(vm.files.length == 0)
            {
              $timeout(function(){
                vm.busy = false;
                $location.path('/Thankyou');
              },1500)

            }
            else{
             uploadFiles(vm.files)
             console.log(vm.files)
             /*for (var i in vm.files) {
              console.log(vm.files[i].name);
              console.log(vm.files[i].size);

                if( !vm.files[i]) {
                  delete vm.files[i]
                }
              }*/
              console.log(vm.files.length)

            }
          }

        })

      }

      /*
       vm.processing = true;
       var count = 0;
       var temp = vm.roleData.requirements;
       for( var j in temp){
       console.log('j: ' + j )
       if(temp[j].file_type != "link"){
       if(temp[j].required){
       if(!vm.files[i])
       {
       vm.errors.message = "Missing requirement";
       }
       }*/
      /*    } && temp[j].required)
       {
       for(var i in vm.files){
       console.log(temp[j].name);
       if( vm.files[i].size < 100)
       {   vm.errors.requirements = {};
       vm.errors.requirements.message = temp[j].name + " is required."
       }
       }
       }*/
      /*
       }
       vm.processing = false;

       }
       }*/
      /*isValid(vm.files);*/
      /*if(val(vm.files)){*/
      //Put applicanion data, store media in S3, then save reference to DB.
      /*Applicant.apply(vm.appData).then(function(resp){
       vm.applicantID = resp.data.appID;
       vm.appData = "";
       if(vm.roleData){
       uploadFiles(vm.files)
       }
       }*/
      /*)}};*/
      /* ----------------- Uploader -------------- */
      $scope.abort = function(index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
      };
      var uploadFiles = function(data){
        vm.upload = [];
        var uploadFiles = data;
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
                          file_type: file.type
                        };
                        Applicant.update(vm.applicantID,parsedData);

                      } else {
                        alert('Upload Failed, please resubmit your application.');
                      }
                    }, null, function(evt) {
                      file.progress =  parseInt(100.0 * evt.loaded / evt.total);
                      if(file.progress == 100){
                        numFilesDone++;
                        if(numFilesDone == numFiles) //hack,because resp 4 times
                        {   vm.busy = false;
                          $location.path('/Thankyou');
                        }
                      }

                    });
                });
            }(file, i));
        }
      };

    }]);
