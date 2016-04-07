angular.module('applyCtrl',['userService','mgcrea.ngStrap']).
  controller('ApplyController',['$scope','$rootScope',
    'Upload','$http', 'Project', 'Role','Applicant',
    '$routeParams','Pub','$location','$timeout','AWS',
    function ($scope, $rootScope, Upload, $http, Project,
              Role, Applicant, $routeParams, Pub, $location,$timeout,AWS)
    {
      $scope.$emit("hideNav");
      var vm = this;
      /*vm.checkFile = function(file){
        console.log(file)
      }*/
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

      vm.link =""
      vm.newLinks= [];
      vm.addLink = function(index,name){
        var link = {};
        link.name = name; link.source = vm.newLinks[index];

        if(link.source.indexOf('.') > -1) {
          vm.appData.links.push(link)
          vm.newLinks[index] = "";
        }
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
      vm.busy = true; 
      vm.currfile; 

        for (link in vm.newLinks ){
          console.log(vm.newLinks[link]);
          if(vm.newLinks[link]){
            vm.appData.links.push(vm.newLinks[link])     
          }
        }

      Applicant.apply(vm.appData).then(function(resp){
        vm.applicantID = resp.data.appID;
        vm.appData = "";
        if(vm.roleData){
          /*console.log("role data" + vm.roleData);
          console.log("file length" + vm.files.length);*/
          /*console.log(vm.applicantID);*/
          if(vm.files.length == 0)
          {
            $timeout(function(){
              vm.busy = false;
              $location.path('/Thankyou');
            },1500)

          }
          else{
            AWS.uploadAppMedias(vm.files, vm.roleData, vm.applicantID,
            $rootScope.awsConfig.bucket);
            $rootScope.$on("app-media-submitted", function(){
              vm.busy =false;
              $location.path('/Thankyou');
            })
          }
        }

      })

    }
    }]);
