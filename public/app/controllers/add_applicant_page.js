angular.module('addApplicant', ['userService', 'mgcrea.ngStrap'])

//normalize new link: num of links text fields = num role.requirements
.controller('AddApplicantController',
  function(Applicant, Auth, Role, $location, $routeParams, $rootScope,
    $scope, $aside, $routeParams, $location, $route, $window,
    $timeout, AWS, $q) {
    var vm = this;

    var requirement = "";
    vm.processing = false;
    vm.applicants = [];
    vm.reqView = [];
    vm.newData = {}; // new applicant data
    vm.SHLinks = []; //new applicant hide/show
    vm.appSHLinks = []; //applicant hide/show
    //send public user to login page.
    vm.loggedIn = Auth.isLoggedIn();

    if (!vm.loggedIn) {
      $location.path("/login")
    }
    //Initiate Protocols
    vm.processing = true;
    Role.get($routeParams.role_id)
      .success(function(data) {
        vm.resetNewApp();
        vm.processing = false;
        vm.role = data.data;
        //Init hide/show links array. 
        vm.SHLinks = new Array(vm.role.requirements.length);
        for (var i in vm.role.requirements) {
          vm.SHLinks[i] = false;
        }

      })
      .error(function(error) {
        console.log(error);
      })
      //Body
    var anotherApp = function(callback) {
      console.log(vm.newData)
      vm.processing = true;
      var name = vm.newData.name;
      /*console.log(vm.newData)*/
      console.log(vm.newData.links)
      if (name && name.first != "" && name.last != "") {
        normalizeLink(function(){
          vm.newData.roleIDs.push(vm.role._id)
          console.log(vm.newData)
          
          
          
          vm.applicants.push(vm.newData)
          /*console.log(vm.applicants)*/
        /*  console.log(vm.applicants)

          console.log(vm.appSHLinks)

          console.log(vm.newData.links)
          console.log(vm.newData.files)
  */
          //init matrix
          //matrix: #applicants x #requirements

          
          console.log(vm.appSHLinks);
          vm.resetNewApp();
          vm.processing = false;
          console.log(vm.applicants)
        });
      }
      return callback();
    }

    var normalizeLink = function(callback) {
      console.log(vm.newData.links);
      console.log(vm.applicants)
      var NUMAPP = vm.applicants.length;
      vm.appSHLinks[NUMAPP] = [];

      for (var i in vm.newData.links) {
        var temp = {};
        temp.source = vm.newData.links[i]
        temp.name = vm.role.requirements[i].name;
        vm.newData.links[i] = {}
        if (temp.source && temp.source.length > 3) {
          vm.newData.links[i] = temp;
        }
      }

  
      for (var i in vm.role.requirements) {

        var curReqmt = vm.role.requirements[i].name;
        /*if (vm.newData.files.length > 0 || vm.newData.links.length > 0) {*/
          console.log("file length")
          console.log(vm.newData.files.length)
          
          vm.appSHLinks[NUMAPP][i] = false; //default
          // true if has the corresponding requirement
          if (vm.newData.files.length > 0) {
            for (var j in vm.newData.files) {
              var fRequirement = vm.newData.files[j].requirement;
              console.log("file requirement")
              console.log(fRequirement)
              console.log("current requirement")
              console.log(curReqmt)
              if (fRequirement === curReqmt) {
                console.log("Adding true, file")
                vm.appSHLinks[NUMAPP][i] = true;
                break;
              }
            }
          }
        // true if has the corresponding requirement
        if (vm.newData.links.length > 0) {
          for (var j in vm.newData.links) {
            var link = vm.newData.links[j]
            console.log("link")
            console.log(link)
            if (link.name === curReqmt) {
              console.log("adding true, link")
              console.log("current requirement ID")
              console.log(i)
              vm.appSHLinks[NUMAPP][i] = true;
            }
          }
        }

      }
      return callback();
    }
    vm.removeApp = function(index) {
      if (vm.applicants.length > 1) {
        if (index === 0) vm.applicants.shift();
        else vm.applicants.splice(index, 1);
      } else {
        vm.applicants = []
      }
    }

    vm.resetNewApp = function() {
        console.log("reseting app")
        vm.files = [];
        vm.newData = {};
        vm.newData.files = [];
        vm.newData.name = {};
        vm.newData.files = [];
        vm.newData.name.first = "";
        vm.newData.name.last = "";
        vm.newData.age = "";
        vm.newData.gender = "Female";
        vm.newData.email = "";
        vm.newData.message = "";
        vm.newData.roleIDs = [];
        vm.newData.links = [];
        vm.newLinks = [];
        if (vm.role) {
          for (var i in vm.role.requirements) {
            vm.SHLinks[i] = false;
            console.log(vm.SHLinks[i])
          }
        }
      }
      /*vm.resetNewApp();*/
    vm.addAppBtn = function() {
      anotherApp(function() {})
    }
    vm.togAppLinkBtn = function(appNdx, reqNdx){
      console.log(appNdx)
      console.log(reqNdx)
      vm.appSHLinks[appNdx][reqNdx] = !vm.appSHLinks[appNdx][reqNdx];
      var linkArr = vm.applicants[appNdx].links;
      vm.removeElFrmArray(reqNdx, linkArr);
    }
    vm.togAddLinkBtn = function(index) {
      vm.SHLinks[index] = !vm.SHLinks[index];
      /*vm.removeLink(index)*/
      vm.removeElFrmArray(index, vm.newData.links)
    }

    vm.newRqmnt = function(data) {
      requirement = data;
      vm.requirement = data;
      console.log(requirement)
    }

    vm.removeLink = function(index) {
      if (vm.newData.links.length >= 1) {
        if (index === 0) vm.newData.links.shift();
        else vm.newData.links.splice(index, 1);
      } else {
        vm.newData.links = []
      }
    }

    vm.ifRequirement = function(rqmnt, fileArr) {
      console.log("ifRequirment")
      console.log(rqmnt)
      console.log(fileArr)
      /*console.log(vm.newData.links)*/
      if (fileArr) {
        for (i in fileArr) {
          console.log(rqmnt)
          console.log(fileArr[i].requirement)
          if (rqmnt === fileArr[i].requirement) {
            return false;
          }
        }
      }
      /*     if(vm.newData.links){
             for(i in vm.newData.links){
               if(vm.newData.links[i].name === rqmnt){
                 return false;
               }
             }
           }*/
      return true;
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

    vm.onFileSelect = function(file) {
      prepFile(file, vm.newData.files)
    }

    vm.onFileSelectApplicants = function(file) {
      prepFile(file, vm.applicants[curAppIndex].files)
    }

    vm.hasData = function(rqmnt, files, links) {
      console.log(rqmnt)
      console.log(links)
      console.log(files)
      if (links) {
        for (var i in links) {
          var link = links[i];

          console.log(link)
          if (link.name === rqmnt) {
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
    vm.updateCurApp = function(index) {
      curAppIndex = index;
      console.log(curAppIndex)
    }

    vm.removeElFrmArray = function(index, array) {
      console.log(index);
      console.log(array)
      if (array.length >= 1) {
        /*if (index === 0) array.shift();
        else*/ array.splice(index, 1);
      } else {
        array = new Array();
      }
      console.log(array)
    }
    var createMatixRow = function() {
      
    }

    vm.back = function() {
      $window.history.back();
    }

    vm.submit = function() {
      vm.processing = true;
      anotherApp(function() {

        console.log(vm.applicants)
        console.log(vm.applicants.length)

        var uploadCounter = 0;
        var numUploaded = 0;
        var ready2UploadFiles = [];
        var promises = [];

        for (var i in vm.applicants) {
          var data = vm.applicants[i];
          var uploadFiles = data.files
          data.files = null;

          if (uploadFiles && uploadFiles.length > 0) {
            /*temp.files = uploadFiles;
            temp.appID = resp.data.appID;*/
            /*console.log("pushing resp. rile uploadFiles");*/
            var uploadCounter = uploadFiles.length;
            ready2UploadFiles.push(uploadFiles);
            /*console.log(ready2UploadFiles);
            console.log(ready2UploadFiles.length);
            console.log(vm.applicants.length);
            console.log(counter);*/
          }

          console.log(ready2UploadFiles)
          console.log(uploadFiles)
          console.log(data)
          Applicant.multiApply(data).then(function(resp) {

            console.log(resp)
            promises.push(resp);
            /*console.log("Counter " + counter);*/
            /*var applicantID = resp.data.appID;*/
            if (vm.applicants.length == promises.length) {
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
                      if (numUploaded === uploadCounter) {
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

.directive('rowapplicant', function() {

  return {
    restrict: 'A',
    scope: {
      role: '=',
      applicant: '=',
      project: '=',
    },
    templateUrl: 'app/views/pages/row_applicant.html',
    controllerAs: 'page',
    bindToController: true,
    //required Angular V1.3 and above to associate scope to value "ppv"
  }
})