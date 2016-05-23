'use strict';
angular.module('ProjectView', ['userService',
    'mgcrea.ngStrap'
  ])

.directive('prpublicview',
  function(Role, Project, $location, $routeParams, $aside, $route) {
    var controller = ['$scope', 'Role', 'Project', "$location",
      '$routeParams', '$aside', '$route','$window',
      function($scope, Role, Project, $location, $routeParams,
        $aside, $route, $window) {
        var vm = this;
        vm.processing = true;
        vm.project = vm.project;
        //function is used in project sharing aside. 
        $scope.preview = function() {
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
        vm.shareRoleBtn = function(data) {
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
          $window.history.back();
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
      }
    ]
    return {
      restrict: 'E',
      scope: {
        project: '=',
        roles: '=',
        toggle: '&',
        roleView: '&',
      },
      templateUrl: 'components/project_view/project_npublic_view.html',
      controller: controller,
      controllerAs: 'vm',
      bindToController: true //required in 1.3+ with controllerAs

    }
  })