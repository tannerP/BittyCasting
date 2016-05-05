angular.module('applyCtrl', ['userService', 'mgcrea.ngStrap']).
controller('ApplyController', ['$scope', '$rootScope',
  'Upload', '$http', 'Project', 'Role', 'Applicant',
  '$routeParams', 'Pub', '$location', '$timeout', 'AWS', 'Meta',
  function($scope, $rootScope, Upload, $http, Project,
    Role, Applicant, $routeParams, Pub, $location, $timeout, AWS, Meta) {
    $scope.$emit("hideNav");
    var vm = this;
    vm.roleData = {};
    vm.appData = {};
    vm.appData.links = [];
    vm.files = [];
    vm.curRole = {};

    $scope.submitted = false;
    /*TODO: condense when combine project and role schema*/
    Pub.getAppRole($routeParams.id).then(function(data) {
      vm.roleData = data.data.Application;
      $rootScope.meta.url = vm.roleData.short_url;
      /*console.log($rootScope.meta.url);*/
      if (vm.roleData) { //TODO:remove? 
        Pub.getAppPrj(vm.roleData.projectID).then(function(data) {
          var project = data.data.project.project;
          var roles = data.data.project.roles;
          if (project) {
            $rootScope.meta = Meta.roleMeta(vm.roleData, project);
            vm.prjData = project;
            vm.prjData.roles = roles;
            vm.updateCurRole(roles[0]);
            vm.appData.projectID = data.data.project._id;
            vm.appData.roleID = vm.roleData._id;
          }
        })
      }
      //clean requirements
      for (var i in vm.roleData.requirements) {
        if (!vm.roleData.requirements[i].selected) {
          vm.roleData.requirements.splice(i, ++i);
        }
        if (vm.roleData.requirements[i].format == "Link") {
          vm.appData.links.push(vm.roleData.requirements[i]);
          vm.roleData.requirements.splice(i, ++i);
        }
      }
    });

    vm.updateCurRole = function(role) {
      vm.curRole = role;
    }

    vm.link = ""
    vm.newLinks = [];
    
    vm.addLink = function(index, name) {
      var link = {};
      link.name = name;
      link.source = vm.newLinks[index];

      if (link.source.indexOf('.') > -1) {
        vm.appData.links.push(link)
        vm.newLinks[index] = "";
      }
    }

    vm.removeLink = function(index) {
      console.log("button Press");
      console.log(index)
      if (vm.appData.links.length > 1) {
        if (index === 0) vm.appData.links.shift();
        else vm.appData.links.splice(index, index);
      } else if (vm.appData.links.length == 1) {
        vm.appData.links = []
      }
    }

    vm.processing = false;
    vm.submit = function() {
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
          vm.processing = true;
          vm.applicantID = resp.data.appID;
          vm.appData = "";
          if (vm.roleData) {
            if (vm.files.length == 0) {
              $timeout(function() {
                vm.processing = false;
                $location.path('/Thankyou');
              }, 1500)

            } else { 
              AWS.uploadAppMedias(vm.files, vm.roleData, vm.applicantID,
                $rootScope.awsConfig.bucket);
                //broacast from AWS
                $rootScope.$on("app-media-submitted", function() {
                vm.processing = false;
                $location.path('/Thankyou');
              })
            }
          }
        })
    }
  }
]);