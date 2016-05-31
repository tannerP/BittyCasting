angular.module('projectCtrl', ['userService',
    'mgcrea.ngStrap'
  ])
  .directive('prpublicview',
    function(Role, Project, $location, $routeParams, $aside, $route) {
      var controller = ['$scope', 'Role', 'Project', "$location",
        '$routeParams', '$aside', '$route', '$window',
        function($scope, Role, Project, $location, $routeParams,
          $aside, $route, $window) {
          var vm = this;
          vm.processing = true;
          vm.project = vm.project;
          
          //function is used in project sharing aside. 
          $scope.preview = function() {
            vm.toggle();
            shareProjectAside.toggle();
          }

          var newRoleAside = $aside({
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
            }),
            shareProjectAside = $aside({
              scope: $scope,
              show: false,
              keyboard: true,
              controller: 'shareProjectController',
              controllerAs: 'roleAside',
              templateUrl: '/app/views/pages/project_share.tmpl.html'
            }),
            deleteRoleAside = $aside({
              scope: $scope,
              keyboard: true,
              show: false,
              controller: 'deleteRoleController',
              controllerAs: 'aside',
              templateUrl: '/app/views/pages/role_delete.tmpl.html'
            }),
            deletePrjAside = $aside({
              scope: $scope,
              show: false,
              keyboard: true,
              controller: 'deleteProjectController',
              controllerAs: 'projectAside',
              templateUrl: '/app/views/pages/deleteProject.tmpl.html'
            });
          collabAside = $aside({
            scope: $scope,
            show: false,
            keyboard: true,
            controller: 'collabController',
            controllerAs: 'page',
            templateUrl: '/app/views/pages/collab.tmpl.html'
          });
          vm.collabBtn = function(data) {
            $scope.project = data;
            collabAside.$promise.then(collabAside.toggle);
          }
          vm.deleteBtn = function(data) {
            $scope.roleData = data;
            deleteRoleAside.$promise.then(deleteRoleAside.toggle);
          }
          vm.sharePrjBtn = function(data) {
            $scope.project = data;
            shareProjectAside.$promise.then(shareProjectAside.toggle);
          }
          vm.shareRoleBtn = function(data) {
            $scope.role = data;
            shareRoleAside.$promise.then(shareRoleAside.toggle);
          }
          vm.createBtn = function() {
            vm.roleData = {};
            newRoleAside.$promise.then(newRoleAside.toggle);
          }
          vm.editPrjBtn = function(project) {
            $scope.project = project;
            editPrjAside.$promise.then(editPrjAside.toggle);
          }
          vm.deletePrjBtn = function(data) {
            /*$scope.deletePrjAside.toggle()*/
            $scope.projectData = data;
            deletePrjAside.$promise.then(deletePrjAside.toggle);
            /*deletePrjAside.toggle();*/
          }
          vm.getRoleBtn = function(id) {
            $location.path("/role/" + id)
          }
          vm.back = function() {
            $window.history.back();
          }

          vm.convertInitial = function(name) {
            if(!name) return;
              return initial = name.first[0]+name.last[0];
          }

          vm.save = function() {
            vm.processing = true;
            vm.message;
            Character.save(vm.charData)
              .success(function(data) {
                vm.processing = false;
                vm.projectData = {};
                vm.message = data.message;
                $location.path('/project/' + $routeParams.project_id);
              });
          }
        }
      ]
      return {
        restrict: 'E',
        scope: {
          project: '=',
          roles: '=',
          owner: '=',
          toggle: '&',
          roleView: '&',
        },
        templateUrl: 'components/project_view/project_npublic_view.html',
        controller: controller,
        controllerAs: 'vm',
        bindToController: true //required in 1.3+ with controllerAs

      }
    })

.controller('collabController', function(Mail, Project, $scope) {
  var vm = this;
  vm.guestEmail = "";
  /*var project = $scope.$parent.vm.project; */

  vm.removeBtn = function(collab) {
    Project.removeCollab($scope.project._id, collab);
    /*$route.reload();*/
  }

  vm.inviteBtn = function() {
    Mail.sendCollabInvite($scope.project, vm.guestEmail);
    vm.guestEmail = ""
    vm.emailPlaceHolder = "Email Sent"
  }
})

.controller('ProjectPageController',
  function(Role, Project, HomeService, Meta, $location,
    $routeParams, $scope, $aside, $route, $rootScope) {
    var vm = this;
    vm.prView = false;
    vm.pView = false;;
    vm.processing = true;
    vm.roles = [];
    vm.project = {};
    vm.curRole = {};
    $scope.roleData = {};
    vm.userName = {};
    /*console.log($rootScope.user)*/
    /*vm.userName.first = $rootScope.user.first;
    vm.userName.last = $rootScope.user.last;*/

    (function init() { //start engines
      /*console.log("Project page controller initializing")*/
      Project.get($routeParams.project_id)
        .success(function(data) {
          /*console.log(data)*/
          vm.project = data.project.project;
          

          $rootScope.meta = Meta.prjMeta(vm.project);
          vm.roles = data.project.roles;
          if (vm.roles.length >= 1) {
            vm.curRole = data.project.roles[0];
            vm.requirements = vm.curRole.requirements;
          }
          switch (data.client) {
            case "public":
              {
                /*$scope.$emit("hideNav")
                $scope.$emit("showFooter")
                vm.prView = false;
                vm.pView = true;;*/
                $location.path("/Apply/Project/" + $routeParams.project_id);
                break;
              }
            case "owner":
              {
                vm.isOwner = true;
                break;
              }
            case "collab":
              {
                vm.isOwner = false;
                break;
              }
            default:
              {
                $location.path("/home");
              }
          }
        })
        .error(function(err) {
          console.log(err)
          vm.message = err;
        });
    })();
    /*HomeService.getView(function(view){
        console.log(view)
    })*/

    vm.Role_back = function() {
      vm.prView = true;
      vm.pView = false;
    }

    vm.togView = function() {
      vm.prView = !vm.prView;
      vm.pView = !vm.pView;
      if (vm.prView === false) {
        $scope.$emit("hideNav");
        $scope.$emit("showFooter");
      } else {
        $scope.$emit("showNav");
        $scope.$emit("hideFooter");
      }
    }
  })

.controller('shareProjectController', ['$scope', '$alert', '$location',
    '$timeout',
    function($scope, $alert, $location, $timeout) {
      /*console.log("Share project controller");*/

      $scope.textToCopy = $scope.project.short_url;

      $scope.FB_text = "Casting Call: " + $scope.project.name + " \ " + $scope.project.description;

      $scope.Email_text = "Hey, \n \n \t I just created an acting role in BittyCasting that I thought might interest you. Check out the project and role by clicking the link:" + $scope.textToCopy + "\n \n Thanks!";

      $scope.Twitter_text = "CASTING CALL: " + $scope.project.name + " " + $scope.textToCopy + " " + "via " + " " + "@BittyCasting ";

      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$hide()
      });
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

      var previewLink = "/Apply/Project/" + $scope.project._id;
      $scope.preview = function() {
        $scope.$emit('aside.hide')
        $timeout(function() {
          $scope.$hide();
          $location.path(previewLink)
        }, 100)
      }

      $scope.success = function() {
        $scope.toggle = true;
        successAlert.toggle();
        $scope.textToCopy = "Copied!"
        $timeout(function(){
          $scope.textToCopy = $scope.project.short_url;
        },1500);
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
      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$emit('aside.hide')
        $scope.$hide()
      });
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

            if ($location.path().indexOf("/role") > -1) {
              $scope.$emit('aside.hide')
              $window.history.back();
            } else {
              $route.reload();
            }
            vm.roleData = {};
            $scope.$hide()
          })
          .error(function(err) {
            console.log(err.message);
          })
      }
    }
  ])
  .controller('editRoleController',
    function(Role, $location, $routeParams,
      $route, $scope, $timeout, Prerender) {
      var vm = this;
      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$hide()
      });
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
            $scope.$emit('aside.hide')
            $route.reload();
            Prerender.cacheRole($routeParams.role_id);
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

  .controller('HomePageController',
    function(Project, HomeService, $location, $aside, $scope,$rootScope) {
      var vm = this;
      $scope.aside = {};
      $scope.aside.projectData = {}

      Project.getAll()
        .success(function(data) {
          vm.processing = false;
          vm.projects = data.data;
          for (var i in vm.projects) {
            var projectID = vm.projects[i]._id;
            console.log(projectID)
            console.log($rootScope.user.invites)
            if ($rootScope.user.invites.indexOf(projectID) > -1) {
              console.log("guest = true")
              vm.projects[i].guest = true;
            }
          }
        })

      vm.acceptProject = function(project) {
        Project.response2Invite(true, project).then(function(data) {})
      }
      vm.rejectProject = function(project) {
        Project.response2Invite(false, project).then(function(data) {
          console.log(data)
        })
      }
      vm.getProject = function(prjID) {
        $location.path('/projectDetails/' + prjID);
      }

      vm.setGridVw = function() {
          HomeService.setView("GRID")
          updateView();
        }
        /*vm.setGridVw();*/

      vm.setListVw = function() {
        HomeService.setView("LIST")
        updateView();
      }

      vm.newPrjBtn = function() {
        vm.projectData = {};
        newPrjAside.show();
      }
      vm.sharePrjBtn = function(data) {
        $scope.project = data;
        shareProjectAside.$promise.then(shareProjectAside.toggle);
      }
      vm.deleteBtn = function(data) {
        $scope.projectData = data;
        deletePrjAside.toggle();
      }
      vm.getProjectBtn = function(id) {
        $location.path("/project/" + id);
      }

      /*Helpers  */
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
      shareProjectAside = $aside({
        scope: $scope,
        show: false,
        keyboard: true,
        controller: 'shareProjectController',
        controllerAs: 'projectAside',
        templateUrl: '/app/views/pages/project_share.tmpl.html'
      });


      var updateView = function() {
        //call back returns a string
        HomeService.getView(function(view) {
          /*console.log(view)*/
          if (view === "GRID") {
            /*console.log('setting grid style')*/
            vm.listStyle = {
              'opacity': 0.2
            };
            vm.gridStyle = {
              'opacity': 1
            };
            vm.listView = false;
            vm.gridView = true;

          } else if (view === "LIST") {
            /*console.log('setting list style')*/
            vm.listStyle = {
              'opacity': 1
            };
            vm.gridStyle = {
              'opacity': 0.2
            };
            vm.gridView = false;
            vm.listView = true;

            /*vm.setGridVw()*/
          } else {
            /*console.log("else statement ")*/
            vm.setGridVw()
          }

        });
      };
  updateView();
    })
  .controller('newProjectController',
    function(Project, $location, $route, $rootScope,
      $scope, Upload, AWS, Prerender) {
      var DEFAULT_COVERPHOTO = "/assets/imgs/img_projectCover01.png";
      var vm = this;
      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$hide()
      });
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
                Prerender.cacheProject(data.projectID);
                $scope.$hide();
                $scope.$emit('aside.hide')
                $route.reload();
                vm.message = data.message;

                vm.processing = false;
                $scope.projectData = {};
                /*$location.path('/home');*/
              })
          } else {
            AWS.uploadCP(vm.CP_cust, function(data) {
              vm.projectData.coverphoto = data;
              console.log(data)
              Project.create(vm.projectData)
                .success(function(data) {
                  Prerender.cacheProject(data.projectID);
                  $scope.$hide()
                  $scope.$emit('aside.hide')
                  $route.reload();
                  vm.message = data.message;
                  vm.processing = false;
                  $scope.projectData = {};
                  return;
                });
            });
          }
        }
      }
    })

//page: project.html
.controller('editProjectController',
    function($scope, Project, $location, $routeParams,
      $route, AWS, $rootScope, Prerender) {
      var vm = this;
      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$hide()
      });
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
      vm.processing = false;
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

      vm.processing = false;
      vm.update = function(data) {
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
          //Updating Project cover photo
        } else if (vm.CP_cust) {
          AWS.uploadCP(vm.CP_cust, $rootScope.awsConfig.bucket, function(data) {
            vm.projectData.coverphoto = data;
            Project.update(vm.projectData._id,
                vm.projectData)
              .success(function(data) {
                Prerender.cacheProject(vm.projectData._id);
                $scope.$emit('aside.hide')
                vm.processing = false;
                $scope.projectData = {};
                $route.reload();
                $scope.$hide()
              });
          });
        }
        //not updating Project cover photo
        Project.update(vm.projectData._id,
            vm.projectData)
          .success(function(data) {
            Prerender.cacheProject(vm.projectData._id);
            $scope.$emit('aside.hide')
            $scope.projectData = {};
            vm.processing = false;
            /*vm.message = data.message;*/
            $route.reload();
            $scope.$hide()
          })
      }
    })
.controller('newRoleController',
    function(Role, $location, $routeParams, $route, $scope, Prerender) {
      var vm = this;
      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$hide()
      });
      vm.edit = false;
      vm.processing = false;
      var SD = new Date()
      SD.setDate(SD.getDate() + 30);

      $scope.selectedDate = SD;
      vm.roleData = {},
        vm.roleData.requirements = [{
          name: "Headshot",
          required: true,
          format: "Attachment"
        }, {
          name: "Resume",
          required: false,
          format: "Attachment"
        }, {
          name: "Reel",
          required: false,
          format: "Attachment"
        }],
        vm.newData = {},
        vm.newData.name = "",
        vm.newData.required = false,
        vm.newData.format = "Attachment";

      vm.addReqt = function(data) {
        if (!data) {
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
          vm.newData.required = false,
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
          vm.addReqt(vm.newData);
        }

        Role.create(vm.projectID, vm.roleData)
          .success(function(data) {
            vm.roleData = {};
            $scope.$emit('aside.hide')
            $route.reload();
            Prerender.cacheRole(data.role._id);
            vm.processing = false;
            $scope.$hide()

          })
          .error(function(err) {
            console.log(err.message);
          })
      }
    })

  //Change to style.flexDirection = 'column-reverse'
  .controller('deleteProjectController', ['$scope', '$alert', 'Project', '$location', '$route',
    function($scope, $alert, Project, $location, $route) {
      var vm = this;
      vm.process = true;
      vm.existing = true;
      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$emit('aside.hide')
        $scope.$hide()
      });
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
              $scope.$emit('aside.hide')
              $scope.$hide();
              $location.path("/home")
            } else {
              $scope.$emit('aside.hide')
              $route.reload();
              $scope.$hide();
            }
          })
      }
    }
  ]);