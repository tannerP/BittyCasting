angular.module('projectCtrl', ['userService',
  'mgcrea.ngStrap'
])

.controller('ProjectPageController',
    function(Role, Project, Meta, $location, 
      $routeParams, $scope, $aside, $route, $rootScope) {
      var vm = this;
      vm.prView = false;
      vm.pView = false;;
      vm.processing = true;
      vm.roles = [];
      vm.project = {};
      vm.curRole = {};
      $scope.roleData = {};

      (function init() { //start engines
        Project.get($routeParams.project_id)
          .success(function(data){
            vm.project = data.project.project;
            $rootScope.meta = Meta.prjMeta(vm.project);
            vm.roles = data.project.roles;
            vm.curRole = data.project.roles[0];

            //filter requirements 
            vm.curRole.requirements =[];
            for(var r in vm.roles){
              var rqmnt = vm.roles[r].requirements;
              if(vm.curRole.requirements.indexOf(rqmnt.name))

              console.log(rqmnt)
            }

            switch(data.client){
            case "public": {
              $scope.$emit("hideNav")
              vm.prView = false;
              vm.pView = true;;
              break;
            }
            case "owner": {vm.prView = true; break;}
            }
          })
          .error(function(err) {
            console.log(err)
            vm.message = err;
          });
      })();
      
      vm.togView = function() {
        vm.prView = !vm.prView;
        vm.pView = !vm.pView;
        if (vm.prView === false) $scope.$emit("hideNav");
        else $scope.$emit("unhideNav");
      }
  })
  .controller('shareRoleController', ['$scope', '$alert', '$location',
    function($scope, $alert, $location) {


        //TODO: this is a temp fix for projeview-private,
        // table view role sharing
       if($scope.role){
          $scope.roleData  = $scope.role;
        }
      $scope.textToCopy = $scope.roleData.short_url;  
      
      $scope.FB_text = "Casting Call: " + $scope.roleData.name
                         + " \ " + $scope.roleData.description;

      $scope.Email_text = "Hey, \n \n \t I just created an acting role in BittyCasting that I thought might interest you. Check out the project and role by clicking the link:" + $scope.textToCopy + "\n \n Thanks!";

      $scope.Twitter_text = "CASTING CALL: " + $scope.roleData.name 
                            + " " + $scope.roleData.short_url + " "
                            + "via " + " " + "@BittyCasting ";

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
      console.log("Share project controller");

      $scope.textToCopy = $scope.project.short_url;

      $scope.FB_text = "Casting Call: " + $scope.project.name + " \ " + $scope.project.description;

      $scope.Email_text = "Hey, \n \n \t I just created an acting role in BittyCasting that I thought might interest you. Check out the project and role by clicking the link:" + $scope.textToCopy + "\n \n Thanks!";

      $scope.Twitter_text = "CASTING CALL: " + $scope.project.name 
                          + " " + $scope.textToCopy + " " + "via " + " " 
                          + "@BittyCasting ";

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
            
            if ($location.path().indexOf("/role") > -1)
            { $window.history.back(); } 
            else{ $route.reload(); }
            
            vm.roleData = {};
            $scope.$hide()
          })
          .error(function(err){
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
        newPrjAside.show();
      }
      vm.deleteBtn = function(data) {
        $scope.projectData = data;
        deletePrjAside.toggle();
      }
      vm.getProjectBtn = function(id) {
        $location.path("/project/" + id);
      }

      Project.getAll()
        .success(function(data) {
          vm.processing = false;
          vm.projects = data.data;
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

      vm.delete = function(projID) {
        Project.delete(projID)
          .success(function() {
            $route.reload();
            vm.processing = false;
            vm.projectData = null;
            if ($location.path().indexOf("project") != -1) {
              $scope.$hide();
              $location.path("/home")
            } else {
              $route.reload();
              $scope.$hide();
            }
          })
      }
  }
]);