angular.module('applyCtrl', ['userService', 'mgcrea.ngStrap'])
  .controller('AddApplicantController',
    function(Applicant, Auth, Role, $location, $routeParams, $rootScope,
      $scope, $aside, $routeParams, $location, $route, $window, $timeout, AWS, $q) {
      var vm = this;
      var requirement = "";
      vm.processing = false;
      vm.applicants = [];
      //send public user to login page.
      vm.loggedIn = Auth.isLoggedIn();
      if (!vm.loggedIn) {
        $location.path("/login")
      }
      vm.files = [];
      vm.newData = {};
      vm.newData.files = [];
      vm.newData.name = {};
      vm.newData.files = {};
      vm.newData.name.first = "",
        vm.newData.name.last = "",
        vm.newData.age = "",
        vm.newData.gender = "",
        vm.newData.email = "",
        vm.newData.message = "",
        vm.newData.roleIDs = [],
        vm.newData.links = [],

        vm.processing = true;
      Role.get($routeParams.role_id)
        .success(function(data) {
          vm.processing = false;
          vm.role = data.data;
          var now = new Date()
          var endDate = new Date(data.data.end_date);
          var timeDiff = endDate - now;
          var left = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (left < 8) {
            if (left > 1) {
              vm.remaining = left + " days left";
              vm.prjClosed;
              return;
            } else if (left === 1) {
              vm.remaining = "Ends today";
              vm.prjClosed;
              return;
            } else if (left < 0) {
              vm.remaining = "";
              vm.prjClosed = "(Closed)";
            } else {
              vm.prjClosed = "";
              vm.remaining = "";
            }
          }
        })
        .error(function(error) {
          console.log(error);
        })

      vm.anotherApp = function() {
        vm.processing = true;
        var name = vm.newData.name;

        if (name && name.first != "" && name.last != "") {
          vm.newData.files = vm.files;
          vm.newData.roleIDs.push(vm.role._id)
          console.log(vm.newData.links)
          vm.applicants.push(vm.newData)

          vm.files = [];
          vm.newData = {};
          vm.newData.links = [];
          vm.newData.roleIDs = [];
        }

        vm.processing = false;
        return;
      }

      vm.back = function() {
        $window.history.back();
      }

      vm.addLink = function(link) {
        var temp = {};
        temp.source = link;
        temp.name = requirement;
        if (temp && !vm.processing) {
          vm.newData.links.push(temp)
        }
        /*console.log(link)*/
        console.log(vm.newData.links)
        vm.newLink = ""
      }
      vm.prepImg = function($file, $event, $flow) {
        var temp = {};
        temp.file = $file.file;
        temp.requirement = requirement;
        vm.files.push(temp)
        temp = "";
      }

      vm.newRqmnt = function(data) {
        requirement = data;
      }

      vm.submit = function() {
        vm.processing = true;


        console.log(vm.applicants)
        console.log(vm.applicants.length)

        var counter = 0;
        var numDone = 0;
        var ready2UploadFiles = [];
        var promises = [];

        for (var i in vm.applicants) {
          var data = vm.applicants[i];
          var uploadFiles = data.files
          var temp = {};
          data.files = null;
          if (uploadFiles.length > 0) {
            /*temp.files = uploadFiles;
            temp.appID = resp.data.appID;*/
            ++counter;
            console.log("pushing resp. rile uploadFiles");
            ready2UploadFiles.push(uploadFiles);
            console.log(ready2UploadFiles);
            console.log(ready2UploadFiles.length);
            console.log(vm.applicants.length);
            console.log(counter);
          }

          console.log(data)
          console.log(uploadFiles)
          console.log(counter)
          Applicant.multiApply(data).then(function(resp) {

            console.log(resp)
            promises.push(resp);
            console.log("Counter " + counter);
            /*var applicantID = resp.data.appID;*/
            if(counter == promises.length){
            $q.all(promises).then(function(data) {
              console.log(data)
              for (var i in data) {
                console.log(i)
                console.log(data.length)
                console.log(data)

                var temp = {};
                temp.appID = data[i].data.appID;
                temp.files = ready2UploadFiles[i];

                AWS.uploadS3(temp);
                console.log(temp)
                  /*$rootScope.$on("app-media-submitted",
                    function() {
                      vm.processing = false;
                      numDone++;
                      console.log(numDone)
                      return;
                    })*/
              }
            });
          }
            return;
          })

          console.log(vm.applicants.length);
          console.log(counter);
          /*   if (vm.applicants.length === counter) {
               for (var i in ready2UploadFiles) {
                 console.log(i)
                 console.log(ready2UploadFiles.length)
                 console.log(ready2UploadFiles[i])
                 AWS.uploadS3(ready2UploadFiles[i]);
                 console.log(i)
               }
             }*/
        }
      }
    })

.controller('ApplicantProjectController', ['$scope', '$rootScope',
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
              return;
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
                  return;
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
  '$routeParams', 'Role', '$location', '$timeout', 'AWS', 'Meta', 'Pub',
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