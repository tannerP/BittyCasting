angular.module('applyCtrl', ['userService', 'mgcrea.ngStrap'])

.directive('applyform', function() {
  var link = function(scope, element,
    attrs, controller, transcludeFn) {
    /*console.log(scope)
    console.log(controller)*/
    scope.$watch('ppv.roles', function(newVal, oldVal){
      if(newVal &&newVal.length ===1){
        controller.requirements = newVal[0].requirements;
      }
    })
    return;
  }

  var publicController = function(Applicant, AWS,
    $location, $routeParams, $scope,
    $rootScope, $aside, $route, $timeout, $window) {
    var vm = this;
    $scope.isAside = false;

    /* $scope.$watch('vm.roles', function(data1, data2) {
      console.log(data1)
      console.log(data2)
    });*/
    /*vm.currRoleID = vm.roles[0]._id*/
    vm.loggedIn = false;
    if ($rootScope.user) {
      vm.loggedIn = true;
    };
    vm.isLast = function(index, array){
      if(++index === array.length) return true;
      else return false
    }
    vm.update_CurRole = function(role) {
      vm.curRole = role;
    }

    vm.isSelected = function(id) {
        if (vm.curRole && id === vm.curRole._id) {
          return "rolesDynamicsActive";
        } else if (!vm.curRole && vm.roles[0] && id === vm.roles[0]._id)
          return "rolesDynamicsActive";
        else return false;
      }
      //TODO: this doesn't scale for collabs.

    vm.back = function() {
      $window.history.back();
    }
    vm.link = ""
    vm.newLinks = [];
    vm.appData = {};
    vm.appData.links = [];
    vm.appData.roleIDs = [];
    vm.files = new Array();

    var addReq = function(rmnts) {
      for (var i in rmnts) {
        vm.requirements.push(rmnts[i])
      }
    }

    var updateReq = function() {
      vm.requirements = []; //reset
      vm.files = [];

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

    vm.toggleRole = function(roleID) {
      vm.message = "";
      if (roleID) {
        var index = vm.appData.roleIDs.indexOf(roleID);
        if (index === -1) {
          vm.appData.roleIDs.push(roleID);
          updateReq()
        } else {
          /*console.log("removing")*/
          vm.appData.roleIDs.splice(index, 1);
          updateReq()
        }
      } else console.log("error including role in applicantion")
    }

    /*------------------Form---------------------*/

    vm.addFile = function(files, requirement, index) {
      /*console.log(files)
      console.log(index)
      console.log(requirement)*/

      if (!vm.files[index] || vm.files[index].length < 1) {
        vm.files[index] = new Array();
      }

      for (var i in files) {
        var file = {};
        file.requirement = requirement;
        file.file = files[i]
        vm.files[index].push(file)
      }
    }
    vm.removeFile = function(rIndex, fIndex) {
      if (vm.files[rIndex][fIndex]) {
        vm.files[rIndex].splice(fIndex, 1);
      }
      /*if(vm.files[rIndex].length === 1) vm.files[rIndex] = [];*/
      return;
    }


    vm.addLink = function(arr_index, name) {
      var link = {};

      link.name = name;
      link.source = vm.newLinks[arr_index];
      vm.appData.links.push(link)
      vm.newLinks[arr_index] = "";
    }

    vm.removeLink = function(index) {
      if (vm.appData.links.length >= 1) {
        if (index === 0) vm.appData.links.shift();
        else vm.appData.links.splice(index, 1);
      } else vm.appData.links = []
    }

    var isValid = function(requirements, files, links) {
        /*var */
      for (var i in requirements) {
        var req = requirements[i]
        /*var file = files[i]*/
        var link = links[i]
        if (req.required) {

          if (files[i] && files[i].length > 0) return -1;
          else if (link != null) return -1
          else {
            return i;
          }
        }
        /*console.log(file)*/
        
      }
    }

    vm.processing = false;
    vm.submit = function() {
      var numFiles = 0;
      var uploadFiles =[]


      for (var i in vm.requirements) {
        /*console.log('i is ' + i)
        console.log(vm.files[i])*/
        if (vm.files[i]) {
          for(var j in vm.files[i]){

              uploadFiles.push(vm.files[i][j]);
              numFiles++;
          }
          /*console.log('File length is ' + vm.files[i].length)
          console.log("vm.files[i].length ")
          console.log(vm.files[i].length)*/
          /*numFiles += vm.files[i].length;*/
          /*console.log(vm.files[i].length)*/
        }
      }

      var index = isValid(vm.requirements,vm.files, vm.newLinks);
      vm.message = '';
      /*console.log(index)*/
      if (index > -1) { // valid = -1
        vm.message = "Missing " + vm.requirements[index].name;
        index = null;
        return;
      }

      //Special case when form only display one role (role level sharing)
      if (vm.roles.length === 1) {
        var roleID = vm.roles[0]._id;
        vm.toggleRole(roleID, null)
      }

      if (vm.appData.roleIDs.length < 1) {
        vm.message = "Please select a role above before submitting your application."
        return;
      }


      vm.processing = true;
      var finishedFileCount = 0;
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
      /*console.log("before applying")
      console.log(vm.files)*/
      Applicant.apply(vm.appData)
        .then(function(resp) {
          vm.processing = true;
          vm.applicantID = resp.data.appID;
          //soft out null files in array
          if (numFiles === 0) {
            $timeout(function() {
              vm.processing = false;
              $location.path('/Thankyou');
            }, 1500)

          } else {
            /*console.log(uploadFiles.length)
            console.log(uploadFiles)*/

            AWS.uploadAppMedias(uploadFiles, vm.requirements,
              vm.applicantID, $rootScope.awsConfig.bucket);
            $rootScope.$on("app-media-submitted",
              function() {
                finishedFileCount++;
                /*console.log("num files updated toDB " 
                  + finishedFileCount)*/
                console.log("num files: " + numFiles)
                if (finishedFileCount === numFiles) {
                  $location.path('/Thankyou');
                }
              })
          }
        })
      return vm;
    }
  }
  return {
    restrict: 'E',
    scope: {
      requirements: '=?',
      roles: '=',
      project: '=',
    },
    templateUrl: 'app/views/pages/Apply.html',
    link: link,
    controller: publicController,
    controllerAs: 'ppv',
    bindToController: true,
    //required Angular V1.3 and above to associate scope to value "ppv"
  }
})

.controller('ApplicantProjectLvlController', ['$scope', '$rootScope',
  'Upload', '$http', 'Project', 'Role', 'Applicant',
  '$routeParams', 'Pub', '$location', '$timeout', 'AWS', 'Meta',
  function($scope, $rootScope,
    Upload, $http, Project, Role, Applicant,
    $routeParams, Pub, $location, $timeout, AWS, Meta) {
    var vm = this;
    vm.appData = {}

    Pub.getAppPrj($routeParams.id).then(function(data) {
      vm.project = data.data.project.project;
      $rootScope.meta = Meta.prjMeta(vm.project);
      console.log($rootScope.meta)
      vm.roles = data.data.project.roles;
      if (vm.project) {
        $rootScope.meta = Meta.prjMeta(vm.project);
        vm.appData.projectID = vm.project
      }
    })
    return vm;
  }
])

.controller('ApplicantRoleLvlController', ['$scope', '$rootScope',
  'Upload', '$http', 'Project', 'Role', 'Applicant',
  '$routeParams', 'Role', '$location', '$timeout', 'AWS', 'Meta', 'Pub',
  function($scope, $rootScope, Upload, $http, Project,
    Role, Applicant, $routeParams, Role, $location, $timeout, AWS, Meta, Pub) {
    $scope.$emit("hideNav");
    var vm = this;
    vm.appData = {};
    vm.appData.links = [];
    vm.files = [];
    vm.project = {};
    vm.roles = [];
    vm.requirements = [];

    $scope.submitted = false;
    /*TODO: condense when combine project and role schema*/
    /*    console.log($routeParams.id)*/
    Role.get($routeParams.id).then(function(data) {
      vm.roles = [];
      var castingRole = data.data.data;
      vm.roles.push(castingRole)

      /*      console.log(vm.roles)*/
      if (castingRole) { //TODO:remove? 
        Pub.getAppPrj(castingRole.projectID).then(function(data) {
          vm.project = data.data.project.project;
          $rootScope.meta = Meta.prjMeta(vm.project);
          console.log($rootScope.meta)
          vm.otherRoles = data.data.project.roles;
          if (vm.project && vm.roles[0]) {
            $rootScope.meta = Meta.roleMeta(castingRole, vm.project);
            /*vm.appData.projectID = vm.project
            vm.appData.roleID = castingRole._id;*/
          }
        })
      }
    });
  }
]);