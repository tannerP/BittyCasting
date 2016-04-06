angular.module('projectCtrl', ['userService',
  'mgcrea.ngStrap']).
  controller('ProjectPageController',
  function (Role, Project, $location, $routeParams,
            $scope, $aside, $route) {
    var vm = this;
    vm.processing = true;
    vm.Roles = [];
    vm.project = {};
    $scope.roleData ={}; 

    var newRoleAside = $aside({
        scope: $scope,
        backdrop:'static',
        show: false,
        keyboard: true,
        controller: 'addRoleController',
        controllerAs: 'roleAside',
        templateUrl: '/app/views/pages/role_form.tmpl.html'
      }),
      editPrjAside = $aside({
        scope: $scope,
        backdrop:'static',
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
        /*  for(var i in vm.Roles){
            vm.Roles[i].numApps;
            console.log(i)
            Role.countApps(vm.Roles[i]._id)
            .success(function(data){
              console.log(i)
              console.log(data)
              vm.Roles[i].numApps = data.data
            })
            .error(function(error){
              console.log(error);
            })
        }*/
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
      /*console.log($scope.roleData.short_url)*/
      /*var base_url = config.base_url;
      var url_base_dev = "localhost:8080/Apply/" + $scope.roleData._id;
      var url_base_beta = "beta.bittycasting.com/Apply/" + $scope.roleData._id;*/

      $scope.textToCopy = $scope.roleData.short_url;
      $scope.toggle = false;
      var successAlert = $alert({
          title: 'Copied!',
          animation: 'am-fade-and-slide-top', duration: '1',
          placement: 'top-right', type: 'success', show: false, type: 'success'
        }),
        errAlert = $alert({
          title: '',
          content: 'Copied',
          placement: 'top-right', type: 'info', show: false, type: 'success'
        });

      var previewLink = "/Apply/" + $scope.roleData._id;
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
          console.log("delete button pressed")
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

      /*for(var i in vm.roleData.requirements)
        {
          if(!vm.roleData.requirements[i].selected){
          vm.roleData.requirements.splice(i,i);
        } 
        else{
          for(var j in vm.roleData.requirements[j])
          {

          }
        }
      }*/
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

    vm.newData={};
    vm.newData.format = "Attachment";
    vm.newData.required = true,
     vm.addReqt = function (data) {
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

    vm.removeReqt = function (index) {
      if (vm.roleData.requirements.length > 1) {
        if (index === 0) vm.roleData.requirements.shift();
        else vm.roleData.requirements.splice(index, index);

      }
      else if (vm.roleData.requirements.length == 1) {
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
        {name:"Headshot",
          required:true,
          selected:true,
          format:"Attachment"
        },
        {name:"Resume",
          required:true,
          selected:true,
          format:"Attachment"
        },
        {name:"Reel",
          required:true,
          selected:true,
          format:"Attachment"
        }
      ],
      vm.newData = {},

      vm.newData.name = "",
      vm.newData.required = true,
      vm.newData.format = "Attachment";

    /*$scope.$watch(vm.newData.name, function(newVal, oldVal){
     vm.newData.format = "Hey there!"
     vm.newData.required = true
     })*/

    $scope.selectedDate = new Date();

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
    vm.removeReqt = function (index) {
      console.log("button clicked");
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
      /*vm.roleData.end_time = $scope.selectedTime.toJSON();*/

      vm.roleData.end_time;


      //only include the files selected
   /*   for(var i in vm.roleData.requirements)
      {
        if(!vm.roleData.requirements[i].selected){
          vm.roleData.requirements.splice(i,i);
        } 
        else{
          for(var j in vm.roleData.requirements[j])
          {

          }
        }
      }*/

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
    $scope.aside = {};
    $scope.aside.projectData = {}
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
        for(p in vm.projects){
          /*if(vm.projects[p].coverphoto)*/
        }
        
      })

  }).
  controller('newProjectController', function (Project, $location, $route, $scope, Upload) {
    var vm = this;
    var DEFAULT_COVERPHOTO = "/assets/imgs/img_projectCover01.png";
    vm.NEW = true;

    vm.CPStyling = "select-coverphoto";
    vm.CPStylingSelected = "select-coverphoto-selected";
    vm.selectCP = function(data,index){
      console.log(data)
      var id = "#" + data.split('/').pop().split('.').shift();
/*      console.log(id)*/

      angular.element( document.querySelector("."+vm.CPStylingSelected))
      .removeClass(vm.CPStylingSelected)
      
      var myEl = angular.element( document.querySelector(id));
      myEl.addClass(vm.CPStylingSelected); 

      //store to db
      $scope.aside.projectData.coverphoto = data;
    }
    
    /*var MAX_LENGTH = 220;
     $scope.charRmnd = MAX_LENGTH;
     $scope.TAChange = function()
     {$scope.charRmnd  =  MAX_LENGTH - vm.projectData.description.length;}*/
    vm.save = function () {
      vm.processing = true;
      vm.message;
      if($scope.aside.projectData){
        if(!$scope.aside.projectData.coverphoto){
          $scope.aside.projectData.coverphoto = DEFAULT_COVERPHOTO;
        }
      Project.create($scope.aside.projectData)
        .success(function (data) {
          $route.reload();
          vm.processing = false;
          vm.message = data.message;
          $scope.$hide()
          $scope.projectData = {};
        });
      $location.path('/home');
    }
  }
  }).

  //page: project.html
  controller('editProjectController',
  function ($scope, Project, $location, $routeParams, $route) {
    var vm = this;
    $scope.aside= {};
    vm.NEW = false;
    vm.processing = true;
    vm.projectData;
    vm.proj_id = $routeParams.project_id;

    /*var MAX_LENGTH = 220;
     $scope.TAChange = function()
     {$scope.charRmnd  =  MAX_LENGTH - vm.projectData.description.length;}*/

    vm.CPStyling = "select-coverphoto";
    vm.CPStylingSelected = "select-coverphoto-selected";
    vm.selectCP = function(data,index){
      var id = "#" + data.split('/').pop().split('.').shift();
      
      angular.element( document.querySelector("."+vm.CPStylingSelected))
      .removeClass(vm.CPStylingSelected)
      
      var myEl = angular.element( document.querySelector(id));
      myEl.addClass(vm.CPStylingSelected); 
      //store to db
      $scope.aside.projectData.coverphoto = data;
    }

    Project.get(vm.proj_id)
      .success(function (data) {
        vm.processing = false;
        $scope.aside.projectData = data.project
        /*$scope.TAChange()*/
      })
      .error(function () {
        console.log(error);
      })

    vm.save = function () {
      vm.processing = true;
      vm.message;
      $scope.aside.projectData.updated_date = new Date();
      Project.update($scope.aside.projectData._id,
       $scope.aside.projectData)
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
