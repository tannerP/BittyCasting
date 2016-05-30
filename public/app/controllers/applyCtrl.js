angular.module('applyCtrl', ['userService', 'mgcrea.ngStrap'])

.directive('applyform', function() {
  var link = function(scope, element, 
    attrs, controller, transcludeFn) {

    console.log(scope)

    scope.$watch('roles', function(old,_new){
      console.log(old)
      console.log(_new)
    })

    return;
  }

  var publicController = function(Applicant, AWS,
    $location, $routeParams, $scope,
    $rootScope, $aside, $route, $timeout, $window) {
    var vm = this;
    $scope.isAside = false;
    /*vm.currRoleID = vm.roles[0]._id*/
    vm.loggedIn = false;
    if ($rootScope.user) {
      vm.loggedIn = true;
    };

    vm.update_CurRole = function(role) {
        vm.curRole = role;
      }

    vm.isSelected = function(id){
      if(vm.curRole && id === vm.curRole._id){
        return "rolesDynamicsActive";
      }
      else if(!vm.curRole &&vm.roles[0] && id === vm.roles[0]._id)
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
    vm.files = [];

    var addReq = function(rmnts) {
      console.log(rmnts)
      for (var i in rmnts) {
        vm.requirements.push(rmnts[i])
      }
    }

    var updateReq = function() {
      vm.requirements = []; //reset

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

    /*---------------------------------------*/

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


    vm.processing = false;
    vm.submit = function() {
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
      Applicant.apply(vm.appData)
        .then(function(resp) {
          vm.processing = true;
          vm.applicantID = resp.data.appID;
          var numFiles = 0;
          //soft out null files in array
          for(var i in vm.files){
            if(vm.files[i] != null) numFiles++;
          }
          if (numFiles === 0) {
            $timeout(function() {
              vm.processing = false;
              $location.path('/Thankyou');
            }, 1500)

          } else {
            AWS.uploadAppMedias(vm.files, vm.requirements,
              vm.applicantID, $rootScope.awsConfig.bucket);
            $rootScope.$on("app-media-submitted",
              function() {
                finishedFileCount++;
                console.log("num files updated toDB " + finishedFileCount)
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
      requirements: '=',
      roles: '=',
      project: '=',
    },
    templateUrl: 'app/views/pages/applicant_form.html',
    link:link,
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