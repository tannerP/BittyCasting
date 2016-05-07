'use strict';
angular.module('ProjectView', ['userService',
    'mgcrea.ngStrap'
  ])
  /*notice ppublicview vs prpublicview and,
   their assiociated html-page differences*/
  .directive('ppublicview', function() {
    /*var link = function($scope,element, attrs){
      var vm = this;
      console.log(vm);
      console.log($scope);
      
      console.log(element);
      console.log(attrs);
    }*/

    var publicController = function(Applicant, AWS,
      $location, $routeParams, $scope,
      $rootScope, $aside, $route) {
      var vm = this;
      vm.loggedIn = $rootScope.loggedIn;       

      vm.update_CurRole = function(new_currRole) {
        vm.currole = new_currRole;
      }
      //TODO: this doesn't scale for collabs.
      vm.back = function(){
        if($rootScope.loggedIn){
          vm.toggle();    
        }
        else{
          $location.path("/");
        }
      }
    vm.link = ""
    vm.newLinks = [];
    vm.appData = {};
    vm.appData.links = [];
    vm.appData.roleIDs = [];
    vm.files= [];
    
    vm.isSelected = function(roleID){
      console.log(roleID)
      var index = vm.appData.roleIDs.indexOf(roleID);
      console.log(index)
        if (index === -1 ){
          console.log("false")
          return false;
        }
        else return true;
        /*console.log("true")*/
    }

    vm.toggleRole = function(roleID){
      vm.message = "";
      if(roleID){
        var index = vm.appData.roleIDs.indexOf(roleID);
        if (index === -1 ){
          vm.appData.roleIDs.push(roleID);
        }
        else{
          /*console.log("removing")*/
          vm.appData.roleIDs.splice(index,++index); 
        }
      }
      else console.log("error including role in applicantion")
    }
  
  /*---------------------------------------*/

    vm.addLink = function(arr_index, name) {
      var link = {};
      
      link.name = name;
      link.source = vm.newLinks[arr_index];
      vm.appData.links.push(link)
      vm.newLinks[arr_index] = "";
    }

    vm.removeLink = function(index) {
      if (vm.appData.links.length > 1) {
        if (index === 0) vm.appData.links.shift();
        else vm.appData.links.splice(index, index);
      } else if (vm.appData.links.length == 1) {
        vm.appData.links = []
      }
    }

    vm.processing = false;
    vm.submit = function() {
      if(vm.appData.roleIDs.length < 1)
      {
        vm.message = "Please select roles you're apply for."
        return;
      }
      vm.processing = true;
      vm.currfile;
        for (i in vm.newLinks) {
          if (vm.newLinks[i]) {
            var link = {};
            link.name = name;
            link.source = vm.newLinks[i];
            if (link.source.indexOf('.') > -1) {
              vm.appData.links.push(link)
              vm.newLinks[i] = "";
            }
          }
        }
      Applicant.apply(vm.appData)
        .then(function(resp) {
          console.log(resp)
          vm.processing = true;
          vm.applicantID = resp.data.appID;
          /*if (vm.roleData) {*/
            /*if (vm.rqmnts) {*/
            if (vm.files.length == 0) {
              $timeout(function() {
                vm.processing = false;
                $location.path('/Thankyou');
              }, 1500)

            } else { 
              AWS.uploadAppMedias(vm.files, vm.roles[0],
                vm.applicantID, $rootScope.awsConfig.bucket);
                //broacast from AWS
                $rootScope.$on("app-media-submitted",
                  function() {
                  vm.processing = false;
                  $location.path('/Thankyou');
                })
            }
          /*}*/
        })
      return vm;
    }
  }
    return {
      restrict: 'E',
      scope: {
        toggle: '&',
        currole: '=',
        roles: '=',
        project: '=',
      },
      templateUrl: 'components/project_view/project_public_view.html',
      controller: publicController,
      controllerAs: 'ppv',
      bindToController: true,
      //required Angular V1.3 and above to associate scope to value "ppv"
    }
  })
  
  .directive('prpublicview', 
    function(Role, Project, $location, $routeParams, $aside, $route) {
    var controller = ['$scope','Role','Project',"$location",
    '$routeParams','$aside','$route',
    function($scope,Role, Project, $location, $routeParams,
       $aside, $route) {
      var vm = this;
      vm.processing = true;
      vm.project = vm.project;
      //function is used in project sharing aside. 
      $scope.preview = function(){
        vm.toggle();
        shareProjectAside.toggle();
      }

      var newRoleAside = $aside({
          scope: $scope,
          show: false,
          static: false,
          backdrop: "static",
          controller: 'newRoleController',
          controllerAs: 'roleAside',
          templateUrl: '/app/views/pages/role_form.tmpl.html'
        }),
        editPrjAside = $aside({
          scope: $scope,
          show: false,
          controller: 'editProjectController',
          controllerAs: 'projectAside',
          templateUrl: '/app/views/pages/project_form.tmpl.html'
        }),
        shareRoleAside = $aside({
          scope: $scope,
          show: false,
          keyboard: true,
          controller: 'shareRoleController',
          controllerAs: 'roleAside',
          templateUrl: '/app/views/pages/role_share.tmpl.html'
        }),
        shareProjectAside = $aside({
          scope: $scope,
          show: false,
          keyboard: true,
          controller: 'shareProjectController',
          controllerAs: 'roleAside',
          templateUrl: '/app/views/pages/project_share.tmpl.html'
        }),
        deleteRoleAside = $aside({
          scope: $scope,
          keyboard: true,
          show: false,
          controller: 'deleteRoleController',
          controllerAs: 'aside',
          templateUrl: '/app/views/pages/role_delete.tmpl.html'
        }),
        deletePrjAside = $aside({
          scope: $scope,
          show: false,
          keyboard: true,
          controller: 'deleteProjectController',
          controllerAs: 'projectAside',
          templateUrl: '/app/views/pages/deleteProject.tmpl.html'
        });
      vm.deleteBtn = function(data) {
        $scope.roleData = data;
        deleteRoleAside.$promise.then(deleteRoleAside.toggle);
      }
      vm.sharePrjBtn = function(data) {
        $scope.project = data;
        shareProjectAside.$promise.then(shareProjectAside.toggle);
      }
      vm.shareRoleBtn = function(data)   {
        $scope.role = data;
        shareRoleAside.$promise.then(shareRoleAside.toggle);
      }
      vm.createBtn = function() {
        vm.roleData = {};
        newRoleAside.$promise.then(newRoleAside.toggle);
      }
      vm.editPrjBtn = function(project) {
        $scope.project = project;
        editPrjAside.$promise.then(editPrjAside.toggle);
      }
      vm.deletePrjBtn = function(data) {
        /*$scope.deletePrjAside.toggle()*/
        $scope.projectData = data;
        deletePrjAside.$promise.then(deletePrjAside.toggle);
        /*deletePrjAside.toggle();*/
      }
      vm.getRoleBtn = function(id) {
        $location.path("/role/" + id)
      }
      vm.back = function() {
        $location.path('/home');
      }

      vm.load = function() {
        Project.get($routeParams.project_id)
          .success(function(data) {
            vm.project = data.project.project;
            vm.Roles = data.project.roles
          })
          .error(function(err) {
            console.log(err);
            vm.message = err;
          });
      }

      /*vm.load();*/

      vm.save = function() {
        vm.processing = true;
        vm.message;
        Character.save(vm.charData)
          .success(function(data) {
            vm.processing = false;
            vm.projectData = {};
            vm.message = data.message;
            $location.path('/project/' + $routeParams.project_id);
          });
      }
    }]
    return {
      restrict: 'E',
      scope: {
        project: '=',
        roles: '=',
        toggle: '&',
      },
      templateUrl: 'components/project_view/project_npublic_view.html',
      controller: controller,
      controllerAs: 'vm',
      bindToController: true //required in 1.3+ with controllerAs

    }
  })