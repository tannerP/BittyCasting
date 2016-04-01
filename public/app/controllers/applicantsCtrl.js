angular.module('applicantsCtrl', ['userService',
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
  controller('ApplicantsPageController',
  function (Applicant, Role, $location, $routeParams,
            $scope, $aside, $routeParams, $location, $route) {
    var vm = this;
   
    function addSlide(target, data) {
      var i = target.length;
      var fileTypes = ["video", "image", "applicants/pdf", "link"];

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
        console.log(fType)
        if (fType == "Link") {
          $scope.links.push(sourceArr[i]);
          addSlide(target, sourceArr[i]);
        }
        if (fType.indexOf('video') != -1) {
          sourceArr[i].name += "." + fType.split("/")[1]; 
          $scope.video.push(sourceArr[i]);
          addSlide(target, sourceArr[i]); //carousel
          console.log("added");
        }
        else if (fType.indexOf('image') != -1) {
          sourceArr[i].name += "." + fType.split("/")[1]; 
          $scope.images.push(sourceArr[i]);
          addSlide(target, sourceArr[i]);	//carousel
          console.log("added");
        }
        else if (fType == "application/pdf") {
          $scope.documents.push(sourceArr[i]);
          addSlide(target, sourceArr[i]);

        }
      console.log(sourceArr[i].name)
      }
    }
    Role.get($routeParams.role_id)
      .success(function (data) {
        vm.processing = false;      
        $scope.roleData = data.data;
        
        //calculate remaining days
        var now = new Date()
        var endDate = new Date(data.data.end_date);
        var timeDiff = endDate - now;
        var left = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        if(left < 8) vm.remaining = left//less than a wk 
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
          //get headshot
          for(var i in vm.applicants){
            for(var j in  vm.applicants[i].suppliments)
            {
              console.log(vm.applicants[i].suppliments[j].name)
              if(angular.equals(vm.applicants[i].suppliments[j].name, "Headshot") ||
              angular.equals(vm.applicants[i].suppliments[j].name, "headshot")  )/*||
                vm.applicants[i].suppliments[j].name =="headshot"*/
              {
                vm.applicants[i].headshot = vm.applicants[i].suppliments[j].source;
                break;
              }
              else vm.applicants[i].headshot= "/assets/imgs/img_projectCover01.png";
            }
          }

        })
        .error(function (error) {
          console.log(error);
        })
    }

    getApps();

    var editRoleAside = $aside({
        scope: $scope,
        backdrop:'static',
        show: false,
        controller: 'editRoleController',
        container:"body",
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
     $scope.viewApp = false;
    $scope.slides = [];
    vm.gridView = true;
    vm.listView = false;

    vm.gridStyle = {'opacity': 1};

    vm.getProject = function (prjID) {
      $location.path('/projectDetails/' + prjID);
    }
    vm.setGridVw = function () {
      vm.listStyle = {'opacity': 0.2};
      vm.gridStyle = {'opacity': 1};
      vm.listView = false;
      vm.gridView = true;
    }
    vm.setListVw = function () {
      vm.listStyle = {'opacity': 1};
      vm.gridStyle = {'opacity': 0.2};
      vm.gridView = false;
      vm.listView = true;
    }
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
  })