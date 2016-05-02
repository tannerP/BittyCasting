angular.module('projectCtrl', ['userService',
  'mgcrea.ngStrap'
])

.controller('ProjectPageController',
    function(Role, Project, $location, $routeParams,
      $scope, $aside, $route) {
      var vm = this;
      vm.processing = true;
      vm.Roles = [];
      vm.project = {};
      $scope.roleData = {};

    /*  var newRoleAside = $aside({
          scope: $scope,
          show: false,
          static: false,
          backdrop: "static",
          controller: 'newRoleController',
          controllerAs: 'roleAside',
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
      vm.deleteBtn = function(data) {
        $scope.roleData = data;
        deleteRoleAside.$promise.then(deleteRoleAside.toggle);
      }
      vm.shareBtn = function(data) {
        vm.roleData = data;
        $scope.roleData = data;
        shareRoleAside.$promise.then(shareRoleAside.toggle);
      }
      vm.createBtn = function() {
        vm.roleData = {};
        newRoleAside.$promise.then(newRoleAside.toggle);
      }
      vm.editPrjBtn = function(project) {
        console.log(project)
        vm.roleData = {};
        editPrjAside.$promise.then(editPrjAside.toggle);
      }
      vm.deletePrjBtn = function(data) {
        $scope.projectData = data;
        deletePrjAside.$promise.then(deletePrjAside.toggle);
      }
      vm.getRoleBtn = function(id) {
        $location.path("/applicants/" + id)
      }*/

      //remove, get data from parent scope
/*      Project.get($routeParams.project_id)
        .success(function(data) {
          vm.project = data.project;
          $scope.projectData = data.project;
        })
        .error(function(err) {
          vm.message = err;
        });
*/
      var vm = this;
      vm.pView, vm.prView;
      (function init() { //start engines
        vm.pView = false;
        vm.prView = true;
        Project.get($routeParams.project_id)
          .success(function(data) {
            vm.project = data.project;
            if (data.client === "public") {
              vm.pView = true;
              vm.prView = false;
            } else if (data.client === "owner") {
              vm.pView = false;
              vm.prView = true;
            }
          })
          .error(function(err) {
            console.log(err)
            vm.message = err;
          });
      })();

      //get project data. 

      //signal view to render the right view 
      //according to project's ownership (ownner,. 

      $scope.togView = function() {
        console.log("toggle clicked")
        vm.pView = !vm.pView;
        vm.prView = !vm.prView;
        if (vm.pView === true) $scope.$emit("hideNav");
        else $scope.$emit("unhideNav");
      }
    })
  .controller('shareRoleController', ['$scope', '$alert', '$location',
    function($scope, $alert, $location) {
      /*console.log($scope.roleData.short_url)*/
      /*var base_url = config.base_url;
      var url_base_dev = "localhost:8080/Apply/" + $scope.roleData._id;
      var url_base_beta = "beta.bittycasting.com/Apply/" + $scope.roleData._id;*/

      $scope.textToCopy = $scope.role.short_url;
      $scope.FB_text = "Casting Call: " + $scope.roleData.name + " \ " + $scope.roleData.description;

      $scope.Email_text = "Hey, \n \n \t I just created an acting role in BittyCasting that I thought might interest you. Check out the project and role by clicking the link:" + $scope.textToCopy + "\n \n Thanks!";

      $scope.Twitter_text = "CASTING CALL: " + $scope.roleData.name + " " + $scope.roleData.short_url + " " + "via "; + " " + "@BittyCasting ";


      $scope.toggle = false;
      var successAlert = $alert({
          title: 'Copied!',
          animation: 'am-fade-and-slide-top',
          duration: '1',
          placement: 'top-right',
          type: 'success',
          show: false,
          type: 'success'
        }),
        errAlert = $alert({
          title: '',
          content: 'Copied',
          placement: 'top-right',
          type: 'info',
          show: false,
          type: 'success'
        });

      var previewLink = "/Apply/" + $scope.roleData._id;
      $scope.preview = function() {
        $scope.$toggle();
        $location.path(previewLink)
      }
      $scope.success = function() {
        $scope.toggle = true;
        successAlert.toggle();
      };

      $scope.fail = function(err) {
        console.error('Error!', err);
        errAlert.toggle();
      }
    }
  ])
  .controller('shareProjectController', ['$scope', '$alert', '$location',
    function($scope, $alert, $location) {

      $scope.textToCopy = $scope.project.short_url;
      $scope.FB_text = "Casting Call: " + $scope.roleData.name + " \ " + $scope.roleData.description;

      $scope.Email_text = "Hey, \n \n \t I just created an acting role in BittyCasting that I thought might interest you. Check out the project and role by clicking the link:" + $scope.textToCopy + "\n \n Thanks!";

      $scope.Twitter_text = "CASTING CALL: " + $scope.roleData.name + " " + $scope.textToCopy + " " + "via "; + " " + "@BittyCasting ";

      $scope.toggle = false;
      var successAlert = $alert({
          title: 'Copied!',
          animation: 'am-fade-and-slide-top',
          duration: '1',
          placement: 'top-right',
          type: 'success',
          show: false,
          type: 'success'
        }),
        errAlert = $alert({
          title: '',
          content: 'Copied',
          placement: 'top-right',
          type: 'info',
          show: false,
          type: 'success'
        });

      var previewLink = "/project/" + $scope.roleData._id;
      $scope.preview = function() {
        $scope.$toggle();
        $location.path(previewLink)
      }
      $scope.success = function() {
        $scope.toggle = true;
        successAlert.toggle();
      };

      $scope.fail = function(err) {
        console.error('Error!', err);
        errAlert.toggle();
      }
    }
  ])
  .controller('deleteRoleController', ['$scope',
    'Role', '$location', '$routeParams', '$route', '$alert', "$window",
    function($scope, Role, $location, $routeParams, $route, $alert, $window) {
      var vm = this;
      vm.input1 = false, vm.input2 = false;
      var errAlert = $alert({
        title: 'Whoops',
        content: 'Please check all',
        animation: 'am-fade-and-slide-top',
        duration: '5',
        placement: 'top-right',
        type: 'danger',
        show: false,
        type: 'success'
      });
      vm.delete = function(id) {
        Role.delete(id)
          .success(function() {
            vm.roleData = {};
            if ($location.path().indexOf("/applicants") > -1) {
              $window.history.back();
            } else {
              $route.reload();
            }
            $scope.$hide()
              //check if at project page, if not direct to project page.

          })
          .error(function(err) {
            console.log(err.message);
          })
      }
    }
  ])
  .controller('editRoleController',
    function(Role, $location, $routeParams, $route, $scope, $timeout) {
      var vm = this;
      vm.edit = true;
      vm.processing = false;
      vm.roleData = {};
      angular.copy($scope.roleData, vm.roleData)

      $scope.selectedDate = vm.roleData.end_date;

      //TODO: remove. sing angular-elastic 
      /*if($scope.roleData.description){
       vm.D_Row = $scope.roleData.description.length/55;
        vm.D_Row = Math.round(vm.D_Row);
      }*/

      /*var MAX_LENGTH = 220;
      $scope.TAChange = function () {
        $scope.charRmnd = MAX_LENGTH - vm.roleData.description.length;
      }*/
      vm.processing = false;
      vm.updateRole = function() {
        if (vm.newData.name) {
          vm.addReqt(vm.newData);
        }
        vm.processing = true;
        vm.roleData.end_date = $scope.selectedDate;
        vm.roleData.updated_date = new Date();
        Role.update($routeParams.role_id, vm.roleData)
          .success(function() {
            $route.reload();
            $timeout(function() {
              vm.processing = false;
              vm.projectData = null;
              $scope.$hide();
            }, 150);
            /*vm.processing = false;
            vm.projectData = null;
            $scope.$hide();*/
          })
          .error(function(err) {
            console.log(err.message);
          })
      }

      vm.newData = {};
      vm.newData.format = "Attachment";
      vm.newData.required = true,
        vm.addReqt = function(data) {
          if (!data.name) {
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
            vm.newData.required = true,
            vm.newData.format = "Attachment",
            vm.newData.selected = true;
        }

      vm.removeReqt = function(index) {
        if (vm.roleData.requirements.length > 1) {
          if (index === 0) vm.roleData.requirements.shift();
          else vm.roleData.requirements.splice(index, index);

        } else if (vm.roleData.requirements.length == 1) {
          vm.roleData.requirements = []
        }
      }

    })
  .controller('newRoleController',
    function(Role, $location, $routeParams, $route, $scope, Prerender) {
      var vm = this;
      vm.edit = false;
      vm.processing = false;
      var SD = new Date()
      SD.setDate(SD.getDate() + 30);

      $scope.selectedDate = SD;
      vm.roleData = {},
        vm.roleData.requirements = [{
          name: "Headshot",
          required: true,
          selected: true,
          format: "Attachment"
        }, {
          name: "Resume",
          required: true,
          selected: true,
          format: "Attachment"
        }, {
          name: "Reel",
          required: true,
          selected: true,
          format: "Attachment"
        }],
        vm.newData = {},
        vm.newData.name = "",
        vm.newData.required = true,
        vm.newData.format = "Attachment";

      vm.addReqt = function(data) {
        if (!data) {
          console.log("error: input variable");
          return;
        }
        var item = {
          name: data.name,
          format: data.format,
          required: true,
          selected: true
        }
        vm.roleData.requirements.push(item)
        vm.newData.name = "",
          vm.newData.required = true,
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
          console.log("adding role name in createRoleBtn")
          vm.addReqt(vm.newData);
        }

        Role.create(vm.projectID, vm.roleData)
          .success(function(data) {
            vm.roleData = {};
            $route.reload();
            Prerender.cacheIt(data.role._id);
            vm.processing = false;
            $scope.$hide()

          })
          .error(function(err) {
            console.log(err.message);
          })
      }
    })
  .controller('HomePageController',
    function(Project, $location, $aside, $scope) {
      var vm = this;
      $scope.aside = {};
      $scope.aside.projectData = {}
      vm.gridView = true;

      vm.getProject = function(prjID) {
        $location.path('/projectDetails/' + prjID);
      }
      vm.setGridVw = function() {
        vm.listStyle = {
          'opacity': 0.2
        };
        vm.gridStyle = {
          'opacity': 1
        };
        vm.listView = false;
        vm.gridView = true;
      }
      vm.setGridVw();

      vm.setListVw = function() {
        vm.listStyle = {
          'opacity': 1
        };
        vm.gridStyle = {
          'opacity': 0.2
        };
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

      vm.newPrjBtn = function() {
        vm.projectData = {};
        /*newPrjAside.$promise.then(newPrjAside.toggle);*/
        newPrjAside.show();
        /*console.log(vm.projectData);*/
      }
      vm.deleteBtn = function(data) {
        $scope.projectData = data;
        /*deletePrjAside.$promise.then(deletePrjAside.toggle);*/
        deletePrjAside.toggle();
        /*deletePrjAside.toggle();*/
      }
      vm.getProjectBtn = function(id) {
        $location.path("/project/" + id);
      }

      Project.getAll()
        .success(function(data) {
          vm.processing = false;
          vm.projects = data.data;
            /*if(vm.projects[p].coverphoto)*/
        })
    })
  .controller('newProjectController',
    function(Project, $location, $route, $rootScope, $scope, Upload, AWS) {
      var DEFAULT_COVERPHOTO = "/assets/imgs/img_projectCover01.png";
      var vm = this;
      vm.coverphotos = [
        'assets/imgs/img_projectCover01.png',
        'assets/imgs/img_projectCover02.png',
        'assets/imgs/img_projectCover03.png',
        'assets/imgs/img_projectCover04.png',
        'assets/imgs/img_projectCover05.png'
      ];
      vm.NEW = true;
      vm.CPStyling = "select-coverphoto";
      vm.CPStylingSelected = "select-coverphoto-selected";
      vm.CP_cust;
      vm.CP_default;

      var select = function(id) {
        angular.element(document.querySelector("." + vm.CPStylingSelected))
          .removeClass(vm.CPStylingSelected)
        var myEl = angular.element(document.querySelector(id));
        myEl.addClass(vm.CPStylingSelected);
      }

      vm.selectCP = function(source, index) {
        var id = "#" + source.split('/').pop().split('.').shift();
        select(id);
        vm.CP_cust;
        vm.CP_default = source;

      }

      vm.selectCustCP = function() {
        var id = "#cust-cp";
        select(id);
        vm.CP_default;
      }

      vm.prepImg = function(file, event, flow) {
        var data = new Array().push(file);
        vm.CP_cust = file;
      }
      var init = function() {
        //check if coverphot.name == default
        if (vm.NEW) vm.selectCP(DEFAULT_COVERPHOTO, 1);

      }();
      vm.save = function() {
        vm.processing = true;
        vm.message;
        vm.projectData.coverphoto = {};
        if (vm.projectData) {
          if (!vm.CP_cust) {
            if (!vm.CP_default) vm.CP_default = DEFAULT_COVERPHOTO;
            vm.projectData.coverphoto.source = vm.CP_default;
            vm.projectData.coverphoto.name = "default";
            Project.create(vm.projectData)
              .success(function(data) {
                $route.reload();
                vm.processing = false;
                vm.message = data.message;
                $scope.$hide()
                $scope.projectData = {};
                $location.path('/home');
              })
          } else {
            AWS.uploadCP(vm.CP_cust, $rootScope.awsConfig.bucket, function(data) {
              vm.projectData.coverphoto = data;
              Project.create(vm.projectData)
                .success(function(data) {
                  $route.reload();
                  vm.processing = false;
                  vm.message = data.message;
                  $scope.$hide()
                  $scope.projectData = {};
                  $location.path('/home');
                });
            });
          }
        }
      }
    })

//page: project.html
.controller('editProjectController',
    function($scope, Project, $location, $routeParams,
      $route, AWS, $rootScope) {
      var vm = this;
      var DEFAULT_COVERPHOTO = "/assets/imgs/img_projectCover01.png";
      vm.projectData = {};
      angular.copy($scope.project, vm.projectData)
      vm.coverphotos = [
        'assets/imgs/img_projectCover01.png',
        'assets/imgs/img_projectCover02.png',
        'assets/imgs/img_projectCover03.png',
        'assets/imgs/img_projectCover04.png',
        'assets/imgs/img_projectCover05.png'
      ];
      /*angular.copy($scope.projectData,$scope.projectData);*/
      //TODO: remove. Using angular-elastic 
      /*if($scope.aside.projectData.description){
        vm.D_Row = $scope.aside.projectData.description.length/60;
        vm.D_Row = Math.round(vm.D_Row);
      }*/
      vm.CP_cust;
      vm.CP_default;
      vm.NEW = false;
      vm.processing = true;
      vm.proj_id = $routeParams.project_id;
      $scope.file = {};

      vm.CPStyling = "select-coverphoto";
      vm.CPStylingSelected = "select-coverphoto-selected";


      var init = function() {
        //check if coverphot.name == default
        if (vm.NEW) select(DEFAULT_COVERPHOTO);
      }();

      var select = function(id) {
        angular.element(document.querySelector("." + vm.CPStylingSelected))
          .removeClass(vm.CPStylingSelected)
        var myEl = angular.element(document.querySelector(id));
        myEl.addClass(vm.CPStylingSelected);
      }

      //source: image href source. Used as ids 
      vm.selectCP = function(source, index) {
        var id = "#" + source.split('/').pop().split('.').shift();
        select(id);
        vm.CP_cust = null;
        vm.CP_default = source;
      }

      vm.selectCustCP = function() {
        var id = "#cust-cp";
        select(id);
        vm.CP_default = null;
      }

      vm.prepImg = function(file, event, flow) {
        var data = new Array().push(file);
        vm.CP_cust = file;
      }

      vm.update = function(data) {
        /*console.log(data);
        console.log($scope.aside.projectData)*/
        vm.processing = true;
        var pj = data;

        vm.projectData.updated_date = new Date();

        //TODO: check if 
        if (vm.CP_default || !vm.projectData.coverphoto) {
          vm.projectData.coverphoto = {};
          //TODO: need to remove once seems stable
          if (!vm.CP_default) vm.CP_default = DEFAULT_COVERPHOTO;
          //if no stock photo selected
          vm.projectData.coverphoto.source = vm.CP_default;
          vm.projectData.coverphoto.name = "default";
        } else if (vm.CP_cust) {
          AWS.uploadCP(vm.CP_cust, $rootScope.awsConfig.bucket, function(data) {
            $scope.aside.projectData.coverphoto = data;
            Project.update(vm.projectData._id,
                vm.projectData)
              .success(function(data) {
                vm.processing = false;
                vm.message = data.message;
                $scope.projectData = {};
                $route.reload();
                $scope.$hide()
              });
          });
        }
        Project.update(vm.projectData._id,
            vm.projectData)
          .success(function(data) {
            $scope.projectData = {};
            vm.processing = false;
            vm.message = data.message;
            $route.reload();
            $scope.$hide()
          })
      }
    })
  //Change to style.flexDirection = 'column-reverse'
  .controller('deleteProjectController', ['$scope', '$alert', 'Project', '$location', '$route',
    function($scope, $alert, Project, $location, $route) {
      var vm = this;
      vm.process = true;
      vm.existing = true;

      var errAlert = $alert({
        title: 'Whoops',
        content: 'Please check all',
        animation: 'am-fade-and-`sl`ide-top',
        duration: '5',
        placement: 'top-right',
        type: 'danger',
        show: false,
        type: 'success'
      });

      vm.eval = function() {
        if (vm.input1 == true) {
          vm.agreed = true;
        }
      }

      vm.delete = function(projID) {
        Project.delete(projID)
          .success(function() {
            $route.reload();
            vm.processing = false;
            vm.projectData = null;
            /*console.log($location.path().indexOf("project"))*/
            if ($location.path().indexOf("project") != -1) {
              console.log("project");
              $scope.$hide();
              /*$window.history.back();*/
              $location.path("/home")
            } else {
              $route.reload();
              $scope.$hide();
            }
          })
      }
    }
  ]);