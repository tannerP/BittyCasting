'use strict';
angular.module('ApplicantForm', ['userService',
    'mgcrea.ngStrap'
  ])
  /*notice ppublicview vs prpublicview and, their assiociated html-page differences*/
  .directive('applicantForm', function() {
    
    var publicController = function(Role, Project, $location, $routeParams,
      $scope, $rootScope, $aside, $route) {
      $scope.$emit("hideNav");
      var vm = this;
      
      (function init(){
        if(vm.roles)  vm.curRole = vm.roles[0];
        else console.log("No roles")
      })();

      vm.updateCurRole = function(role) {
      vm.curRole = role;
      }

      //check if logged
      vm.loggedIn = $rootScope.loggedIn; 
      vm.back = function(){
        if($rootScope.loggedIn){
          vm.toggle();    
        }
        else{
          $location.path("/");
        }
      }
      return vm;
    }

    return {
      restrict: 'E',
      scope: {
        toggle: '&',
        roles: '=',
        project: '=',
      },
      templateUrl: 'components/project_view/project_public_view.html',
      controller: publicController,
      controllerAs: 'vm',
      bindToController: true, //required in 1.3+ with controllerAs
    }
  })