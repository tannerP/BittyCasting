'use strict';
angular.module('ProjectView', ['userService',
    'mgcrea.ngStrap'
  ])
  .controller('newRoleController',
    function(Role, $location, $routeParams, $route, $scope, Prerender) {
      var vm = this;
      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$hide()
      });
      vm.edit = false;
      vm.processing = false;
      var SD = new Date()
      SD.setDate(SD.getDate() + 30);

      $scope.selectedDate = SD;
      vm.roleData = {},
      vm.roleData.sex = "Female"
        vm.roleData.requirements = [{
          name: "Headshot",
          required: true,
          format: "Attachment"
        }, {
          name: "Resume",
          required: false,
          format: "Attachment"
        }, {
          name: "Reel",
          required: false,
          format: "Attachment"
        }],
        vm.newData = {},
        vm.newData.name = "",
        vm.newData.required = false,
        vm.newData.format = "Attachment";

      vm.addReqt = function(data) {
        if (!data) {
          console.log("error: input variable");
          return;
        }
        var item = {
          name: data.name,
          format: data.format,
          required: data.required,
          selected: true
        }
        vm.roleData.requirements.push(item)
        vm.newData.name = "",
          vm.newData.required = false,
          vm.newData.format = "Attachment",
          vm.newData.selected = true;
      }
      vm.removeReqt = function(index) {
        if (vm.roleData.requirements.length > 1) {
          if (index === 0) vm.roleData.requirements.shift();
          else vm.roleData.requirements.splice(index, index);
        } else if (vm.roleData.requirements.length === 1) {
          vm.roleData.requirements = []
        }

      }
      vm.processing = false;
      vm.createRoleBtn = function() {
        vm.processing = true;
        vm.projectID = $routeParams.project_id;
        vm.roleData.end_date = $scope.selectedDate.toJSON();
        /*vm.roleData.end_time = $scope.selectedTime.toJSON();*/
        vm.roleData.end_time;
        if (vm.newData.name) {
          vm.addReqt(vm.newData);
        }

        Role.create(vm.projectID, vm.roleData)
          .success(function(data) {
            vm.roleData = {};
            $scope.$emit('aside.hide')
            $route.reload();
            Prerender.cacheRole(data.role._id);
            vm.processing = false;
            $scope.$hide()

          })
          .error(function(err) {
            console.log(err.message);
          })
      }
    })

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
            controllerAs: 'vm',
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