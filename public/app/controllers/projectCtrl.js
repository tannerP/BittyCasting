angular.module('projectCtrl', ['userService',
  'mgcrea.ngStrap']).
  controller('CommentBoxCtrl',
  function ($scope, Applicant) {
    var vm = this;
    vm.comments = $scope.currApp.comments;
    vm.newComment;
    vm.comments = $scope.currApp.comments;
    vm.deleteCmt = function (appID, index, comment) {
      Applicant.deleteComment(appID, comment);
      delete $scope.currApp.comments[index];
    }
    vm.addCmt = function (appID, owner, comment) {
      var cmt = {
        owner: owner,
        comment: comment
      }
      $scope.currApp.comments.push(cmt);
      Applicant.pushComment(appID, cmt);
      vm.newComment = "";
    }

  }).
  controller('ApplicantPageController',
  function (Applicant, Role, $location, $routeParams,
            $scope, $aside, $routeParams, $location, $route) {
    var vm = this;
    $scope.viewApp = false;
    $scope.slides = [];
    function addSlide(target, data) {
      var i = target.length;
      var fileTypes = ["video", "image", "document", "link"];

      for (item in fileTypes) {
        if (data.file_type.indexOf(fileTypes[item])) {
          fileTypes[item] = false;
        }
        else {
          fileTypes[item] = true;
        }
      }
      target.push({
        id: (i + 1),
        label: data.name,
        source: data.source,
        video: fileTypes[0],
        image: fileTypes[1],
        document: fileTypes[2],
        link: fileTypes[3],
        odd: (i % 2 === 0)
      });
    };
    $scope.carouselIndex = 0;
    function addSlides(target, sourceArr) {
      var _knwnFtypes = ["jpeg", "pdf", "img"]
      $scope.video = [], $scope.images = [],
        $scope.documents = [], $scope.links = [];

      for (var i = 0; i < sourceArr.length; i++) {
        var fType = sourceArr[i].file_type;
        if (fType.indexOf('image') != -1) {
          $scope.video.push(sourceArr[i]);
          addSlide(target, sourceArr[i]); //carousel
          console.log("added");
        }
        else if (fType.indexOf('video') != -1) {
          $scope.images.push(sourceArr[i]);
          addSlide(target, sourceArr[i]);	//carousel
          console.log("added");
        }
        else if (fType == "application/pdf") {
          $scope.documents.push(sourceArr[i]);
          addSlide(target, sourceArr[i]);

        }
        else if (fType == "link") {
          $scope.links.push(sourceArr[i]);
          addSlide(target, sourceArr[i]);
        }
      }
    }

    Role.get($routeParams.role_id)
      .success(function (data) {
        vm.processing = false;
        $scope.roleData = data.data;
      })
      .error(function (error) {
        console.log(error);
      })

    function getApps() {
      Applicant.getAll($routeParams.role_id)
        .success(function (data) {
          vm.processing = false;
          vm.applicants = data.data;
          $scope.numApps = data.data.length;
        })
        .error(function (error) {
          console.log(error);
        })
    }

    getApps();

    var editRoleAside = $aside({
        scope: $scope,
        show: false,
        controller: 'editRoleController',
        controllerAs: 'roleAside',
        templateUrl: '/app/views/pages/role_form.tmpl.html'
      }),
      shareRoleAside = $aside({
        scope: $scope,
        show: false,
        keyboard: true,
        controller: 'shareRoleController',
        controllerAs: 'roleAside',
        templateUrl: '/app/views/pages/role_share.tmpl.html'
      }),
      deleteRoleAside = $aside({
        scope: $scope,
        keyboard: true,
        show: false,
        controller: 'deleteRoleController',
        controllerAs: 'aside',
        templateUrl: '/app/views/pages/role_delete.tmpl.html'
      }),
      deleteAppAside = $aside({
        scope: $scope,
        keyboard: true,
        show: false,
        templateUrl: '/app/views/pages/applicant_delete.tmpl.html'
      });
    vm.deleteAsideBtn = function (app) {
      $scope.currApp = app
      deleteAppAside.$promise.then(deleteAppAside.toggle);
    }
    vm.deleteRoleBtn = function () {
      /*$scope.roleData = data;*/
      deleteRoleAside.$promise.then(deleteRoleAside.toggle);
    }
    vm.backBtn = function () {
      $scope.viewApp = false;
      $scope.$emit("unhideNav");
    }
    $scope.deleteAppBtn = function () {
      Applicant.delete($scope.currApp._id)
        .success(function () {
          getApps();
          deleteAppAside.hide();
        })
        .error(function (err) {
          console.log(err);
        })
    }
    vm.shareBtn = function () {
      shareRoleAside.$promise.then(shareRoleAside.toggle);
    }
    vm.editRoleBtn = function () {
      editRoleAside.$promise.then(editRoleAside.toggle);
    }
    vm.viewBtn = function (index) {
      $scope.slides = [];
      $scope.$emit("hideNav");
      $scope.currIndex = index;
      $scope.currApp = vm.applicants[index];
      addSlides($scope.slides, $scope.currApp.suppliments);
      $scope.viewApp = true;
    }
    vm.nextApp = function () {
      if ($scope.currIndex < vm.applicants.length - 1) {
        $scope.currIndex += 1;
        vm.viewBtn($scope.currIndex)
      }
    }
    vm.lastApp = function () {
      if ($scope.currIndex > 0) {
        $scope.currIndex -= 1;
        vm.viewBtn($scope.currIndex)
      }
    }
  }).
  controller('ProjectPageController',
  function (Role, Project, $location, $routeParams,
            $scope, $aside, $route) {
    var vm = this;
    vm.processing = true;
    vm.Roles = [];
    vm.project = {};

    var newRoleAside = $aside({
        scope: $scope,
        show: false,
        keyboard: true,
        controller: 'addRoleController',
        controllerAs: 'roleAside',
        templateUrl: '/app/views/pages/role_form.tmpl.html'
      }),
      editPrjAside = $aside({
        scope: $scope,
        keyboard: true,
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
      });
    deleteRoleAside = $aside({
      scope: $scope,
      keyboard: true,
      show: false,
      controller: 'deleteRoleController',
      controllerAs: 'aside',
      templateUrl: '/app/views/pages/role_delete.tmpl.html'
    });
    deletePrjAside = $aside({
      scope: $scope,
      show: false,
      keyboard: true,
      controller: 'deleteProjectController',
      controllerAs: 'projectAside',
      templateUrl: '/app/views/pages/deleteProject.tmpl.html'
    });
    vm.deleteBtn = function (data) {
      $scope.roleData = data;
      deleteRoleAside.$promise.then(deleteRoleAside.toggle);
    }
    vm.shareBtn = function (data) {
      vm.roleData = data;
      $scope.roleData = data;
      shareRoleAside.$promise.then(shareRoleAside.toggle);
    }
    vm.createBtn = function () {
      vm.roleData = {};
      newRoleAside.$promise.then(newRoleAside.toggle);
    }
    vm.editPrjBtn = function () {
      vm.roleData = {};
      editPrjAside.$promise.then(editPrjAside.toggle);
    }
    vm.deletePrjBtn = function (data) {
      /*$scope.deletePrjAside.toggle()*/
      $scope.projectData = data;
      deletePrjAside.$promise.then(deletePrjAside.toggle);
      /*deletePrjAside.toggle();*/
    }
    vm.getRoleBtn = function (id) {

      /*$scope.roleData = role;*/
      $location.path("/applicants/" + id)
    }

    //remove, get data from parent scope
    Project.get($routeParams.project_id)
      .success(function (data) {
        vm.project = data.project;
      })
      .error(function (err) {
        vm.message = err;
      });

    $scope.load = function () {
      Role.getAll($routeParams.project_id)
        .success(function (data) {
          vm.processing = false;
          vm.Roles = data.data;
        })
        .error(function (error) {
          console.log(error);
        })
    }

    $scope.load();
    vm.save = function () {
      vm.processing = true;
      vm.message;
      Character.save(vm.charData)
        .success(function (data) {
          vm.processing = false;
          vm.projectData = {};
          vm.message = data.message;
          $location.path('/project/' + $routeParams.project_id);

        });
    }
  }).
  controller('shareRoleController', ['$scope', '$alert',
    '$location',
    function ($scope, $alert, $location) {
      var url_base = "bittycasting.com/Apply/";
      var url_base_dev = "localhost:8080/Apply/" + $scope.roleData._id;
      var url_base_beta = "beta.bittycasting.com/Apply/" + $scope.roleData._id;

      $scope.textToCopy = url_base_dev;
      var previewLink = "/Apply/" + $scope.roleData._id;
      $scope.toggle = false;
      var successAlert = $alert({
          title: 'Copied!',
          animation: 'am-fade-and-slide-top', duration: '10',
          placement: 'top-right', type: 'success', show: false, type: 'success'
        }),
        errAlert = $alert({
          title: 'Link:',
          content: 'Copied',
          placement: 'top-right', type: 'info', show: false, type: 'success'
        });

      $scope.preview = function () {
        $scope.$toggle();
        $location.path(previewLink)
      }
      $scope.success = function () {
        $scope.toggle = true;
        successAlert.toggle();
      };

      $scope.fail = function (err) {
        console.error('Error!', err);
        errAlert.toggle();
      }
    }
  ]).
  controller('deleteRoleController', ['$scope',
    'Role', '$location', '$routeParams', '$route', '$alert', "$window",
    function ($scope, Role, $location, $routeParams, $route, $alert, $window) {
      var vm = this;
      vm.input1 = false, vm.input2 = false;
      var errAlert = $alert({
        title: 'Whoops', content: 'Please check all',
        animation: 'am-fade-and-slide-top', duration: '5',
        placement: 'top-right', type: 'danger', show: false, type: 'success'
      });
      vm.delete = function (id) {
        if (vm.input1 && vm.input2) {
          Role.delete(id)
            .success(function () {
              vm.roleData = {};
              if ($location.path().indexOf("/applicants") > -1) {
                $window.history.back();
              }
              else {
                $route.reload();
              }
              $scope.$hide()
              //check if at project page, if not direct to project page.

            })
            .error(function (err) {
              console.log(err.message);
            })
        }
        else errAlert.toggle();
      }
    }]).
  controller('editRoleController',
  function (Role, $location, $routeParams, $route, $scope) {
    var vm = this;

    vm.edit = true;
    vm.processing = true;
    vm.roleData = {};
    vm.roleData.requirements = [];

    var MAX_LENGTH = 220;
    $scope.TAChange = function () {
      $scope.charRmnd = MAX_LENGTH - vm.roleData.description.length;
    }

    Role.get($routeParams.role_id)
      .success(function (data) {
        vm.processing = false;
        vm.roleData = data.data;
        $scope.selectedTime = data.data.end_time;
        $scope.selectedDate = data.data.end_date;
        $scope.TAChange()
      })
      .error(function (err) {
        console.log(err);
      })

    vm.updateRole = function () {
      vm.roleData.end_time = $scope.selectedTime;
      vm.roleData.end_date = $scope.selectedDate;
      vm.roleData.updated_date = new Date();
      Role.update($routeParams.role_id, vm.roleData)
        .success(function () {
          $route.reload();
          vm.processing = false;
          vm.projectData = null;
          $scope.$toggle();
        })
        .error(function (err) {
          console.log(err.message);
        })
    }
    $scope.status = {
      isopen: false
    };

    $scope.toggled = function (open) {
      $log.log('Dropdown is now: ', open);
    };

    $scope.toggleDropdown = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };

    vm.addReqt = function (data) {
      if (!data) {
        console.log("error: input variable");
        return;
      }
      var item = {
        name: data.name, file_type: data.file_type,
        required: data.required
      }
      vm.roleData.requirements.push(item)
      vm.newData.name = "New Requirement",
        vm.newData.required = true,
        vm.newData.file_type = "Type";
    }

    vm.removeReqt = function (index) {
      if (vm.roleData.requirements.length > 1) {
        if (index === 0) vm.roleData.requirements.shift();
        else vm.roleData.requirements.splice(index, index);

      }
      else if (vm.roleData.requirements.length === 1) {
        vm.roleData.requirements = []
      }
    }

  }).

  controller('addRoleController',
  function (Role, $location, $routeParams, $route, $scope) {
    var vm = this;
    vm.edit = false,
      vm.roleData = {},
      vm.roleData.requirements = [
        {name:"headshot",
          required:true,
          selected:true,
          type:"file"
        },
        {name:"resume",
          required:true,
          selected:true,
          type:"file"
        },
        {name:"Reel",
          required:true,
          selected:true,
          type:"file"
        }
      ],
      vm.newData = {},

      vm.newData.name = "New Requirement",
      vm.newData.required = true,
      vm.newData.file_type = "Type";

    /*$scope.$watch(vm.newData.name, function(newVal, oldVal){
     vm.newData.file_type = "Hey there!"
     vm.newData.required = true
     })*/

    $scope.selectedDate = new Date();
    $scope.selectedTime = new Date();

    /*var MAX_LENGTH = 220;
     $scope.charRmnd = MAX_LENGTH;
     $scope.TAChange = function()
     {$scope.charRmnd  =  MAX_LENGTH - vm.roleData.description.length;}
     */
    $scope.status = {
      isopen: false
    };

    $scope.toggled = function (open) {
      $log.log('Dropdown is now: ', open);
    };

    $scope.toggleDropdown = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };

    vm.addReqt = function (data) {
      if (!data) {
        console.log("error: input variable");
        return;
      }
      var item = {name: data.name,
       format: data.format,
        required: data.required,
        selected: true
      }
      vm.roleData.requirements.push(item)
      vm.newData.name = "New Requirement",
        vm.newData.required = true,
        vm.newData.file_type = "Attachment",
        vm.newData.selected = true;
    }
    vm.removeReqt = function (index) {
      if (vm.roleData.requirements.length > 1) {
        if (index === 0) vm.roleData.requirements.shift();
        else vm.roleData.requirements.splice(index, index);
      }
      else if (vm.roleData.requirements.length === 1) {
        vm.roleData.requirements = []
      }

    }
    vm.createRoleBtn = function () {
      vm.projectID = $routeParams.project_id;
      vm.roleData.end_date = $scope.selectedDate.toJSON();
      vm.roleData.end_time = $scope.selectedTime.toJSON();

      vm.roleData.end_time;


      //only include the files selected
      for(var i in vm.roleData.requirements)
      {
        if(!vm.roleData.requirements[i].selected){
          vm.roleData.requirements.splice(i,i);
        } 
        else{
          for(var j in vm.roleData.requirements[j])
          {

          }
        }
      }

      Role.create(vm.projectID, vm.roleData)
        .success(function () {
          vm.roleData = {};
          $route.reload();
          $scope.$hide()
        })
        .error(function (err) {
          console.log(err.message);
        })
    }
  }).
//.html
  controller('HomePageController',
  function (Project, $location, $aside, $scope) {
    var vm = this;
    vm.gridView = true;

    vm.getProject = function (prjID) {
      $location.path('/projectDetails/' + prjID);
    }
    vm.setGridVw = function () {
      vm.listStyle = {'opacity': 0.2};
      vm.gridStyle = {'opacity': 1};
      vm.listView = false;
      vm.gridView = true;
    }
    vm.setGridVw();

    vm.setListVw = function () {
      vm.listStyle = {'opacity': 1};
      vm.gridStyle = {'opacity': 0.2};
      vm.gridView = false;
      vm.listView = true;
    }
    var newPrjAside = $aside({
      scope: $scope,
      show: false,
      keyboard: true,
      controller: 'newProjectController',
      controllerAs: 'projectAside',
      templateUrl: '/app/views/pages/project_form.tmpl.html'
    });
    deletePrjAside = $aside({
      scope: $scope,
      show: false,
      keyboard: true,
      controller: 'deleteProjectController',
      controllerAs: 'projectAside',
      templateUrl: '/app/views/pages/deleteProject.tmpl.html'
    });
    vm.processing = true;
    vm.projects;

    vm.newPrjBtn = function () {
      vm.projectData = {};
      newPrjAside.$promise.then(newPrjAside.toggle);
      /*console.log(vm.projectData);*/
    }
    vm.deleteBtn = function (data) {
      $scope.projectData = data;
      deletePrjAside.$promise.then(deletePrjAside.toggle);
      /*deletePrjAside.toggle();*/
    }
    vm.getProjectBtn = function (id) {
      $location.path("/project/" + id);
    }

    Project.getAll()
      .success(function (data) {
        vm.processing = false;
        vm.projects = data.data;
      })

  }).

  controller('newProjectController', function (Project, $location, $route, $scope) {
    var vm = this;
    vm.NEW = true;
    vm.projectData = {name: "", description: ""};

    /*var MAX_LENGTH = 220;
     $scope.charRmnd = MAX_LENGTH;
     $scope.TAChange = function()
     {$scope.charRmnd  =  MAX_LENGTH - vm.projectData.description.length;}*/
    vm.save = function () {
      vm.processing = true;
      vm.message;
      Project.create(vm.projectData)
        .success(function (data) {
          $route.reload();
          vm.processing = false;
          vm.message = data.message;
          $scope.$hide()
        });
      $location.path('/home');

    }
  }).

  //page: project.html
  controller('editProjectController',
  function ($scope, Project, $location, $routeParams, $route) {
    var vm = this;
    vm.NEW = false;
    vm.processing = true;
    vm.projectData;
    vm.proj_id = $routeParams.project_id;

    /*var MAX_LENGTH = 220;
     $scope.TAChange = function()
     {$scope.charRmnd  =  MAX_LENGTH - vm.projectData.description.length;}*/

    Project.get(vm.proj_id)
      .success(function (data) {
        vm.processing = false;
        vm.projectData = data.project
        $scope.TAChange()

      })
      .error(function () {
        console.log(error);
      })

    vm.save = function () {
      vm.processing = true;
      vm.message;
      vm.projectData.updated_date = new Date();
      Project.update(vm.proj_id, vm.projectData)
        .success(function (data) {
          $route.reload();
          vm.processing = false;
          vm.projectData = null;
          $scope.$hide();

        })
        .error(function (err) {
          console.log(err);
        });

    }
  }).
//Change to style.flexDirection = 'column-reverse'
  controller('deleteProjectController', ['$scope', '$alert', 'Project', '$location', '$route',
    function ($scope, $alert, Project, $location, $route) {
      var vm = this;
      vm.process = true;
      vm.existing = true;

      var errAlert = $alert({
        title: 'Whoops', content: 'Please check all', animation: 'am-fade-and-slide-top', duration: '5',
        placement: 'top-right', type: 'danger', show: false, type: 'success'
      });

      vm.eval = function () {
        if (vm.input1 == true) {
          vm.agreed = true;
        }
      }

      vm.delete = function (projID) {
        if (vm.input1 && vm.input2 && vm.input3) {
          Project.delete(projID)
            .success(function () {
              $route.reload();
              vm.processing = false;
              vm.projectData = null;
              $scope.$hide();

            })
            .error(function (err) {
              console.log(err);
            }
          )
        }
        else {
          errAlert.toggle();
        }
      }
    }]);
