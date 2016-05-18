angular.module('applyCtrl', ['userService', 'mgcrea.ngStrap'])
  .controller('AddApplicantController',
    function(Applicant, Auth, Role, $location, $routeParams, $rootScope,
      $scope, $aside, $routeParams, $location, $route, $window, $timeout, AWS, $q) {
      var vm = this;
      var requirement = "";
      vm.processing = false;
      vm.applicants = [];
      vm.reqView = [];
      //send public user to login page.
      vm.loggedIn = Auth.isLoggedIn();

      if (!vm.loggedIn) {
        $location.path("/login")
      }
      //Initiate Protocols
      vm.processing = true;
      Role.get($routeParams.role_id)
        .success(function(data) {
          vm.processing = false;
          vm.role = data.data;
          //Init hide/show links array. 
          vm.SHLinks = new Array(vm.role.requirements.length);
          for (var i in vm.role.requirements) {
            vm.SHLinks[i] = false;
            console.log(vm.SHLinks[i])
          }

          console.log(vm.SHLinks);
        })
        .error(function(error) {
          console.log(error);
        })
        //Body
      vm.resetNewApp = function() {
        vm.files = [];
        vm.newData = {};
        vm.newData.files = [];
        vm.newData.name = {};
        vm.newData.files = {};
        vm.newData.name.first = "";
        vm.newData.name.last = "";
        vm.newData.age = "";
        vm.newData.gender = "Female";
        vm.newData.email = "";
        vm.newData.message = "";
        vm.newData.roleIDs = [];
        vm.newData.links = [];
        vm.newLinks = [];
      }
      vm.resetNewApp();


      vm.anotherApp = function(callback) {
        console.log(vm.newData)
        vm.processing = true;
        var name = vm.newData.name;
        /*console.log(vm.newData)*/
        /*for(var i in vm.newData.links){
              pv.normalizeLink(vm.newData.links)
        }*/
        console.log(vm.newData.links)
        if (name && name.first != "" && name.last != "") {
          vm.newData.files = vm.files;
          vm.newData.roleIDs.push(vm.role._id)
          vm.applicants.push(vm.newData)

          vm.resetNewApp();
        }
        vm.processing = false;
        callback();
      }

      vm.removeApp = function(index) {
        if (vm.applicants.length > 1) {
          if (index === 0) vm.applicants.shift();
          else vm.applicants.splice(index, index);
        } else {
          vm.applicants = []
        }
      }

      vm.normalizeLink = function(link,index) {
        console.log("about to normalize link")
        console.log(index)
        var tempItem = link;
        console.log(tempItem)
        /*for(var i in linkArr){*/
          var temp ={};
          temp.source = tempItem;
          temp.name = vm.role.requirements[index].name;
          /*vm.removeElFrmArray(i,linkArr); //delete element*/
           vm.newData.links[index] = temp;
           temp = {};
          
        /*}*/
        console.log(vm.newData.links)
      }

      vm.removeLink = function(index) {
        togLinkViews(index);
        if (vm.newData.links.length > 1) {
          if (index === 0) vm.newData.links.shift();
          else vm.newData.links.splice(index, index);
        } else {
          vm.newData.links = []
        }
      }

      var prepFile = function(file, array) {
        var temp = {};
        console.log(file)
        if (file) {
          temp.file = file;
          temp.requirement = requirement;
          array.push(temp)
          temp = "";
          console.log(array)
        }
        return;
      }

      vm.onFileSelectnewEntree = function(file){
        prepFile(file, vm.files)
      }

      vm.onFileSelectApplicants = function(file){
        prepFile(file, vm.applicants[curAppIndex].files)
      }

      vm.hasData = function(rqmnt,files,links){
        console.log(rqmnt)
        console.log(links)
        console.log(files)
        if(links){
          for(var i in links){
            var link = links[i];

            console.log(link)
          if(link.name === rqmnt){
            console.log("return true")
            return true;
          }
        }
        }
        /*if()
        console.log(rqmnt)
        console.log(link)
        console.log(files)*/
        return false;
      }

      var curAppIndex;
      vm.updateCurApp = function(index){
        curAppIndex = index;

        console.log(curAppIndex)
      }

      vm.removeElFrmArray = function(index, array) {

        console.log(index);

        if (array.length >= 1) {
          if (index === 0) array.shift();
          else array.splice(index, index);
        } else {
          array = []
        }
        console.log(array)
      }

      //Show/Hide Links
      var togLinkViews = function(index) {
        vm.SHLinks[index] = !vm.SHLinks[index];
      }

      vm.togAddLinkBtn = function(index) {
        togLinkViews(index);
      }

      vm.newRqmnt = function(data) {
        requirement = data;
        vm.requirement = data;
        console.log(requirement)
      }
      vm.back = function() {
        $window.history.back();
      }

      vm.submit = function() {
        vm.processing = true;
        vm.anotherApp(function(){

        console.log(vm.applicants)
        console.log(vm.applicants.length)

        var uploadCounter = 0;
        var numUploaded = 0;
        var ready2UploadFiles = [];
        var promises = [];

        for (var i in vm.applicants) {
          var data = vm.applicants[i];
          var uploadFiles = data.files
          var temp = {};
          data.files = null;
          if ( uploadFiles && uploadFiles.length > 0) {
            /*temp.files = uploadFiles;
            temp.appID = resp.data.appID;*/
            ++uploadCounter;
            /*console.log("pushing resp. rile uploadFiles");*/
            ready2UploadFiles.push(uploadFiles);
            /*console.log(ready2UploadFiles);
            console.log(ready2UploadFiles.length);
            console.log(vm.applicants.length);
            console.log(counter);*/
          }

          /*console.log(data)
          console.log(uploadFiles)
          console.log(counter)*/
          Applicant.multiApply(data).then(function(resp) {

            /*        console.log(resp)*/
            promises.push(resp);
            /*console.log("Counter " + counter);*/
            /*var applicantID = resp.data.appID;*/
            if (uploadCounter == promises.length) {
              $q.all(promises).then(function(data) {
                /*            console.log(data)*/
                for (var i in data) {
                  /*  console.log(i)
                    console.log(data.length)
                    console.log(data)*/

                  var temp = {};
                  temp.appID = data[i].data.appID;
                  temp.files = ready2UploadFiles[i];

                  AWS.uploadS3(temp);
                  /*                console.log(temp)*/
                  $rootScope.$on("app-media-submitted",
                    function() {
                      numUploaded++;
                      console.log(numUploaded)
                      console.log(uploadCounter)
                      if (numUploaded === 2 * uploadCounter) {
                        $timeout(function() {
                          vm.processing = false;
                          console.log("Going back to Cali")
                          vm.back();
                          return;
                        }, 500 * uploadCounter)
                      }
                      return;
                    })
                }
              });
            }
            return;
          })
        }
      })
      }

    })


.directive('applyform', function() {
  /*  var link = function(scope,element, attrs){
      var vm = this;
      console.log(vm);
      console.log(scope.ppv.roles);
      
      console.log(element);
      console.log(attrs);

      attrs.$observe('project', function(project) {
             /// do what is needed with passedId
             console.log(project);
             return
           });

      scope.$apply(function(scope,element, attrs){
           console.log(vm);
           console.log(scope.ppv.roles);
      console.log(scope.ppv.roles);
      
      console.log(element);
      console.log(attrs);
      });

      console.log(scope.$evalAsync(attrs.project))
      console.log(data)

      scope.$watch(attrs.roles, function(value){
        console.log(value);
      })
    }*/

  /*var link = function(scope, element, attrs, controller, transcludeFn){
    console.log(scope)
    console.log(element)
    console.log(scope.ppv.requirement)
  }*/

  var publicController = function(Applicant, AWS,
    $location, $routeParams, $scope,
    $rootScope, $aside, $route, $timeout, $window) {
    var vm = this;
    vm.loggedIn = false;
    if ($rootScope.user) {
      vm.loggedIn = true;
    };
    /*$scope.$emit("showFooter")*/

    vm.update_CurRole = function(new_currRole) {
        /*console.log(vm.currole)*/
        vm.currole = new_currRole;
      }
      //TODO: this doesn't scale for collabs.
    vm.back = function() {
      /*if ($rootScope.loggedIn) {
        vm.toggle();
      } else {*/
      /*$location.path("/");*/
      $window.history.back();
      /*}*/
    }
    vm.link = ""
    vm.newLinks = [];
    vm.appData = {};
    vm.appData.links = [];
    vm.appData.roleIDs = [];
    vm.files = [];

    var addReq = function(rmnts) {
      /*console.log(rmnts)*/
      for (var i in rmnts) {
        /*console.log(rmnts[i])*/
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
      if (vm.roles.length === 1) {
        var roleID = vm.roles[0]._id;
        vm.toggleRole(roleID, null)
      } else {
        if (vm.appData.roleIDs.length < 1) {
          vm.message = "Please select a role to submit."
          return;
        }
      }

      console.log(vm.appData)
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
          vm.processing = true;
          vm.applicantID = resp.data.appID;
          if (vm.files.length == 0) {
            $timeout(function() {
              vm.processing = false;
              $location.path('/Thankyou');
            }, 1500)

          } else {
            AWS.uploadAppMedias(vm.files, vm.requirements,
              vm.applicantID, $rootScope.awsConfig.bucket);
            $rootScope.$on("app-media-submitted",
              function() {
                $timeout(function() {
                  vm.processing = false;
                  $location.path('/Thankyou');
                }, 1500)
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
    console.log($routeParams.id)
    Role.get($routeParams.id).then(function(data) {
      vm.roles = [];
      var castingRole = data.data.data;
      vm.roles.push(castingRole)

      console.log(vm.roles)
      if (castingRole) { //TODO:remove? 
        Pub.getAppPrj(castingRole.projectID).then(function(data) {
          vm.project = data.data.project.project;
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