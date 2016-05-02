'use strict';
angular.module('ProjectView',['userService',
  'mgcrea.ngStrap'])
/*notice ppublicview vs prpublicview and, their assiociated html-page differences*/
.directive('ppublicview', function() {
  var publicController = function (Role, Project, $location, $routeParams,
          $scope, $aside, $route) {
    var vm = this;
    $scope.$emit("hideNav");
    vm.project = vm.inputData.project
    vm.role = vm.inputData.roles
    
    if(vm.inputData.client === "public"){
      vm.public = true;
    }
    return vm;
  }
  return {
    restrict: 'E',
    scope:{
    	toggle: '&toggleFunc',
      inputData: '=ctrl'
    },
    link:function(scope, element, attrs){
      console.log(attrs);
      console.log(scope);
      var num = scope.$eval(attrs.toggle);
      console.log('number=',num);
      scope.page.toggle();
      /*scope.callback(); */ // calls exampleCallback()
    },
    templateUrl: 'components/project_view/project_public_view.html',
    controller: publicController,
    controllerAs:'page',
    bindToController: true, //required in 1.3+ with controllerAs
  }
})
.directive('prpublicview', function (Role, Project, $location, $routeParams,
             $aside, $route) {
     var controller = function (Role, Project, $location, $routeParams,
            $scope, $aside, $route) {
    var vm = this;
    vm.processing = true;
    vm.Roles = [];
    vm.project = {};
    $scope.roleData ={}; 

    var newRoleAside = $aside({
        scope: $scope,
        show: false,
        static: false,
        backdrop:"static",
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
    vm.deleteBtn = function (data) {
      $scope.roleData = data;
      deleteRoleAside.$promise.then(deleteRoleAside.toggle);
    }
    vm.sharePrjBtn = function (data) {
      $scope.project = data;
      shareProjectAside.$promise.then(shareProjectAside.toggle);
    }
    vm.shareRoleBtn = function (data) {
      console.log(data)
      console.log("Btn pressed")
      $scope.role = data;
      shareRoleAside.$promise.then(shareRoleAside.toggle);
    }
    vm.createBtn = function () {
      vm.roleData = {};
      newRoleAside.$promise.then(newRoleAside.toggle);
    }
    vm.editPrjBtn = function (project) {
      $scope.project = project;
      editPrjAside.$promise.then(editPrjAside.toggle);
    }
    vm.deletePrjBtn = function (data) {
      /*$scope.deletePrjAside.toggle()*/
      $scope.projectData = data;
      deletePrjAside.$promise.then(deletePrjAside.toggle);
      /*deletePrjAside.toggle();*/
    }
    vm.getRoleBtn = function (id) {
      $location.path("/role/" + id)
    }
    vm.back = function(){
      $location.path('/home');
    }

    

    $scope.load = function () {
      Project.get($routeParams.project_id)
      .success(function (data) {
        vm.project = data.project.project;
        vm.Roles = data.project.roles
      })
      .error(function (err) {
        console.log(err);
        vm.message = err;
      });
    }

    $scope.load();
    vm.save = function () {
      vm.processing = true;
      vm.message;
      Character.save(vm.charData)
        .success(function (data) {
          vm.processing = false;
          vm.projectData = {};
          vm.message = data.message;
          $location.path('/project/' + $routeParams.project_id);
        });
    }
  }
    return {
      /*templateUrl: 'components/project_view/project_view.html',*/
      /*templateUrl: 'components/review_page/reviewPage.html',*/
      restrict: 'E',
      scope:{
        project: '=ctrl',
      },
      templateUrl: 'components/project_view/project_npublic_view.html',
      controller: controller,
      controllerAs:'vm',
      bindToController: true //required in 1.3+ with controllerAs

    }
  })
  