angular.module('applyCtrl',['userService','mgcrea.ngStrap'])
	.directive('ApplyController',['$scope','$rootScope',
    'Upload','$http', 'Project', 'Role','Applicant',
    '$routeParams','Pub','$location','$timeout','AWS','Meta',
		var controller = function ($scope, $rootScope, Upload, $http, Project,
              Role, Applicant, $routeParams, Pub, $location,$timeout,AWS,Meta)
    {
      $scope.$emit("hideNav");
      var vm = this;
      vm.roleData={};
      vm.appData ={};
      vm.appData.links=[];
      vm.files=[];

      
      $scope.submitted = false;
      /*TODO: condense when combine project and role schema*/
      Pub.getAppRole($routeParams.id).then(function(data){
        vm.roleData = data.data.Application;

        $rootScope.meta.url = vm.roleData.short_url;
        /*console.log($rootScope.meta.url);*/
        if(vm.roleData){  //TODO:remove? 
          Pub.getAppPrj(vm.roleData.projectID).then(function(data){
              var project = data.data.project.project;
              var roles = data.data.project.roles;
            if(project){
            /*$rootScope.meta.image = project.coverphoto.source;
            $rootScope.meta.title = project.name;
            $rootScope.meta.description = project.description;*/

            $rootScope.meta = Meta.roleMeta(vm.roleData, project);
            /*console.log($rootScope.meta)*/
            vm.prjData = project;
            vm.prjData.roles = roles;
            /*console.log(vm.prjData.roles);*/
            vm.appData.projectID = data.data.project._id;
            vm.appData.roleID = vm.roleData._id;
          }
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
        link.name = name; 
        link.source = vm.newLinks[index];

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

        for (i in vm.newLinks ){
          if(vm.newLinks[i]){
            var link = {};
            link.name = name; 
            link.source = vm.newLinks[i];
            if(link.source.indexOf('.') > -1) {
              vm.appData.links.push(link)
              vm.newLinks[i] = "";
            }
            
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
  }

     return {
      /*templateUrl: 'components/project_view/project_view.html',*/
      /*templateUrl: 'components/review_page/reviewPage.html',*/
      restrict: 'E',
      scope:{
        inputData: '=ctrl',
      },
      templateUrl: 'components/project_view/project_npublic_view.html',
      controller: controller,
      controllerAs:'vm',
      bindToController: true //required in 1.3+ with controllerAs

    }
  })
  