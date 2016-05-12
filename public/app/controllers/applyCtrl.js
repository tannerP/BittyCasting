angular.module('applyCtrl', ['userService', 'mgcrea.ngStrap'])
  .controller('ApplicantProjectController', ['$scope', '$rootScope',
    'Upload', '$http', 'Project', 'Role', 'Applicant',
    '$routeParams', 'Pub', '$location', '$timeout', 'AWS', 'Meta',
    function($scope, $rootScope,
      Upload, $http, Project, Role, Applicant,
      $routeParams, Pub, $location, $timeout, AWS, Meta) {
      var vm = this;
      vm.appData = {}

      Pub.getAppPrj($routeParams.id).then(function(data) {
        console.log(data)
        vm.project = data.data.project.project;
        vm.roles = data.data.project.roles;
        console.log(vm.roles)
        console.log(vm.project)
        if (vm.project) {
          $rootScope.meta = Meta.prjMeta(vm.project);
          /*vm.prjData = vm.project;*/
          /*vm.prjData.roles = roles;*/
          /*vm.updateCurRole(roles[0]);*/
          vm.appData.projectID = vm.project
        }
      })

      vm.update_CurRole = function(new_currRole) {
          /*console.log(vm.currole)*/
          vm.currole = new_currRole;
        }
        //TODO: this doesn't scale for collabs.
      vm.back = function() {
        if ($rootScope.loggedIn) {
          vm.toggle();
        } else {
          $location.path("/");
        }
      }
      vm.link = ""
      vm.newLinks = [];
      vm.appData = {};
      vm.appData.links = [];
      vm.appData.roleIDs = [];
      vm.files = [];

      vm.requirements = [];
      var addReq = function(rmnts) {
        /*console.log(rmnts)*/
        for (var i in rmnts) {
          /*console.log(rmnts[i])*/
          if (vm.requirements.indexOf(rmnts[i].name) === -1) {
            vm.requirements.push(rmnts[i].name)
          }
        }
      }
      var updateReq = function() {
        //search through vm.appData.roleID match with vm.roles
        vm.requirements = [];

        for (var i in vm.roles) { //loop through roles
          /*console.log(vm.roles[i]); */
          var role = vm.roles[i];
          var index = vm.appData.roleIDs.indexOf(role._id);
          if (index != -1) {
            //roles[index] is in rolesIDs
            /*console.log(role.)*/
            addReq(role.requirements);
          }
        }

      }

      vm.toggleRole = function(roleID, requirements) {
        vm.message = "";
        if (roleID) {
          var index = vm.appData.roleIDs.indexOf(roleID);
          if (index === -1) {
            vm.appData.roleIDs.push(roleID);
            /*vm.requirements.push(requirement)*/
            updateReq()
          } else {
            /*console.log("removing")*/
            vm.appData.roleIDs.splice(index, ++index);
            updateReq()
          }
        } else console.log("error including role in applicantion")
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
        if (vm.appData.roleIDs.length < 1) {
          vm.message = "Please select a role to submit."
          return;
        }

        vm.processing = true;
        vm.currfile;
        for (var i in vm.newLinks) {
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
            /*console.log(resp)*/
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
              AWS.uploadAppMedias(vm.files, vm.requirements,
                vm.applicantID, $rootScope.awsConfig.bucket);
              //broacast from AWS
              $rootScope.$on("app-media-submitted",
                function() {
                  $timeout(function() {
                    vm.processing = false;
                    $location.path('/Thankyou');
                  }, 1500)
                })
            }
            /*}*/
          })
      }
      return vm;
    }
  ])

.controller('ApplyController', ['$scope', '$rootScope',
  'Upload', '$http', 'Project', 'Role', 'Applicant',
  '$routeParams', 'Role', '$location', '$timeout', 'AWS', 'Meta','Pub',
  function($scope, $rootScope, Upload, $http, Project,
    Role, Applicant, $routeParams, Role, $location, $timeout, AWS, Meta, Pub) {
    $scope.$emit("hideNav");
    var vm = this;
    vm.roleData = {};
    vm.appData = {};
    vm.appData.links = [];
    vm.files = [];
    vm.curRole = {};
    vm.requirements = []

    $scope.submitted = false;
    /*TODO: condense when combine project and role schema*/
    console.log($routeParams.id)
    Role.get($routeParams.id).then(function(data) {
      console.log(data)
      vm.roleData = data.data.data;
      if (vm.roleData) { //TODO:remove? 
        Pub.getAppPrj(vm.roleData.projectID).then(function(data) {
          vm.project = data.data.project.project;
          vm.roles = data.data.project.roles;
          for (var i in vm.roleData.requirements) {
            vm.requirements.push(vm.roleData.requirements[i].name);
          }
          vm.curRole = data.data.Application;
          $rootScope.meta.url = vm.roleData.short_url;
          if (vm.project) {
            $rootScope.meta = Meta.prjMeta(vm.project);
            /*vm.prjData = vm.project;*/
            /*vm.prjData.roles = roles;*/
            /*vm.updateCurRole(roles[0]);*/
            vm.appData.projectID = vm.project
            vm.appData.roleID = vm.roleData._id;
          }
        })
      }
      //clean requirements
      /*for (var i in vm.roleData.requirements) {
        if (!vm.roleData.requirements[i].selected) {
          vm.roleData.requirements.splice(i, ++i);
        }
      }*/
      /*   if (vm.roleData.requirements[i].format == "Link") {
          vm.appData.links.push(vm.roleData.requirements[i]);
          vm.roleData.requirements.splice(i, ++i);
        }*/
    });

    vm.updateCurRole = function(role) {
        vm.curRole = role;
      }
      /*-------------------------------------------*/
    vm.link = ""
    vm.newLinks = [];

    vm.addLink = function(index, name) {
      var link = {};
      console.log(index)
      console.log(name)
      link.name = name;
      link.source = vm.newLinks[index];
      if (link.source.indexOf('.') > -1) {
        vm.appData.links.push(link)
        vm.newLinks[index] = "";
      }
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
      vm.processing = true;
      vm.currfile;
      vm.appData.roleIDs = [];
      vm.appData.roleIDs.push(vm.roleData._id);
      //add links from text field;
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
              AWS.uploadAppMedias(vm.files, vm.requirements, vm.applicantID,
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