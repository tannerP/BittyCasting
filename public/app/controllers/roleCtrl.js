angular.module('roleCtrl', ['userService',
    'mgcrea.ngStrap'
  ])
  .directive('rolepage',
    function($location, $aside) {
      var link = function(scope, element,
        attrs, controller, transcludeFn) {
        scope.$watch('vm.applicants', function(newApps, oldApps) {
          if (newApps) {
            scope.numApps = newApps.length;
          }
        })

        scope.$watch('vm.role', function(newRole, oldRole) {
          if (newRole && newRole.description) {
              /*console.log(oldRole.length)*/
            scope.roleData = newRole
            controller.roleData = newRole
            scope.descriptionWordCount = newRole.description.split(" ").length;
            /*console.log(scope.descriptionWordCount)*/

            var now = new Date()
            var endDate = new Date(scope.roleData.end_date);
            var timeDiff = endDate - now;
            var left = Math.ceil(timeDiff / (1000 * 3600 * 24));
            //calculate 
            if (left < 8) { //only alert when 7 days left
              /*if (left > 0) { //larger than 0
              }*/
              if (left > 1) {
                controller.remaining = left + " days left";
                controller.prjClosed;
                return;
              } else if (left === 1) {
                controller.remaining = "Ends today";
                controller.prjClosed;
                return;
              } else if (left < 0) {
                controller.remaining = "";
                controller.prjClosed = "(Closed)";
              } else {
                controller.prjClosed = "";
                controller.remaining = "";
              }
            }
          }
        })
      }

      var controller = function(Applicant, Role, $location, $routeParams, $rootScope,
        $scope, $aside, $routeParams, $location, $route,
        $window, $timeout, $route, Meta, RoleService) {
        var vm = this;
        var fav = false;
        vm.newComment = "" // solution for when switch between applicants, 
          //need to clear comment

        vm.setFilter = function(filter) {
          /*console.log("filter")
          console.log(filter)*/
          vm.curFilter = filter
        }

        var editRoleAside = $aside({
            scope: $scope,
            backdrop: 'static',
            show: false,
            keyboard: true,
            controller: 'editRoleController',
            controllerAs: 'vm',
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
        $scope.carouselIndex = 0;
        $scope.slides = [];
        vm.gridView = true;
        vm.listView = false;
        //$scope.isAside track if an aside is open. If it is, 
        //prevent going back, instead, close aside.
        /*$scope.$watch('carouselIndex', function(newVal, oldVal) {
          if (++newVal === $scope.slides.length) $scope.carouselIndex = 5;
        });*/

        $scope.isActive = function(index) {
          /*console.log(index)*/
          var curCarIndex = $scope.carouselIndex;
          /*console.log(curCarIndex)*/
          if (curCarIndex === index) {
            console.log("Actives")
          } else {
            console.log("Inactive")
          }
        }

        vm.setGridVw = function() {
          RoleService.setView("GRID")
          updateView();
          vm.listStyle = {
            'opacity': 0.2
          };
          vm.gridStyle = {
            'opacity': 1
          };
          vm.listView = false;
          vm.gridView = true;
        }

        vm.setListVw = function() {
          RoleService.setView("LIST")
          updateView();
          vm.listStyle = {
            'opacity': 1
          };
          vm.gridStyle = {
            'opacity': 0.2
          };
          vm.gridView = false;
          vm.listView = true;
        }
        var updateView = function() {
          //call back returns a string
          RoleService.getView(function(view) {
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
              vm.setGridVw()
            }

          });
        };
        updateView();

        vm.backBtn = function() {
          $scope.viewApp = false;
          $scope.$emit("showNav");
        }

        var updateCarosel = function(applicant) {
          $scope.newComment = ""
          $scope.carouselIndex = 0;
          $scope.slides = [];
          for (var i in vm.applicants) {
            var temp = vm.applicants[i];
            if (temp._id === applicant._id) {
              $scope.currIndex = parseInt(i);
              break;
            } else $scope.currIndex = 0;
          }

          $scope.currApp = applicant;
          /*console.log("change currApp at updateCarosel")*/
          var app = applicant;
          if (app && app.new) {
            app.new = false;
            vm.updateViewed(app, vm.role._id)
          }
          addSlides($scope.slides, app.suppliments);
        }

        vm.viewBtn = function(app) {
          $scope.$emit("hideNav");
          updateCarosel(app);
          $scope.viewApp = true;
        }

        vm.nextApp = function() {
          if ($scope.currIndex < vm.applicants.length - 1) {
            /*$scope.currIndex = $scope.currIndex;*/
            $scope.currIndex += 1;
            /*vm.viewBtn($scope.currIndex)*/
          } else {
            $scope.currIndex = 0;
          }

          updateCarosel(vm.applicants[$scope.currIndex]);
        }
        vm.lastApp = function() {
          /*console.log($scope.currIndex)*/
          if ($scope.currIndex <= 0) {
            $scope.currIndex = vm.applicants.length - 1;
            /*vm.viewBtn($scope.currIndex)*/
            /*updateCarosel($scope.currIndex)*/
          } else {
            $scope.currIndex -= 1;
            /*updateCarosel($scope.currIndex);*/
          }
          updateCarosel(vm.applicants[$scope.currIndex]);
        }
        vm.updateViewed = function(app, roleID) {
          app.new = false;
          Applicant.viewedUpdate(app._id, roleID);
        }

        /*Optimistic resolution*/
        vm.updateFav = function(index, aplnt, roleID) {
          console.log(index)
          console.log(aplnt)
          console.log(roleID)
          Applicant.favUpdate(aplnt, roleID);
          
          if(aplnt.favs === 0)
          {
            aplnt.numFavs++
          }
          for(var i in aplnt.favs){
            if(aplnt.favs[i].userID === $rootScope.user._id )
            {
              console.log("before")
              console.log(aplnt.favs[i].favorited)
              aplnt.favs[i].favorited = !aplnt.favs[i].favorited
              if(aplnt.favs[i].favorited == false) aplnt.numFavs--;
              else aplnt.numFavs++;
              console.log("after")
              console.log(aplnt.favs[i].favorited)
            }
          }

          if(aplnt.numFavs < 1) {aplnt.favorited = false}
          else {aplnt.favorited = true;}
          return;
          /*$route.reload();*/
        }

        var removeApp = function(appID) {
          if (vm.applicants.length === 1) vm.applicants = [];
          for (var i in vm.applicants) {
            var app = vm.applicants[i]
            if (app._id === appID) {
              vm.applicants.splice(i, 1);
              return;
            }
          }
        }

        $scope.deleteAppBtn = function() {
          Applicant.delete($scope.currApp._id, $scope.roleData._id)
            .success(function() {
              --$scope.numApps;
              
              removeApp($scope.currApp._id);

              if ($scope.viewApp === true) { //full page review
                if ($scope.numApps === 0) {
                  $scope.currApp = {};
                  vm.backBtn();
                }
                vm.lastApp();
              }
              deleteAppAside.hide();

            })
            .error(function(err) {
              /*console.log(err);*/
              deleteAppAside.hide();
            })

        }

        $scope.goToLink = function(url) {
          var tmp = url.spli
          if (url.indexOf('http') != -1) {
            $window.open(url);
          } else {
            $window.open("http://" + url);
          }
        }

        function addSlide(target, data) {
          var i = target.length;
          var fileTypes = ["video", "image", "applicantion/pdf", "link"];

          for (item in fileTypes) {
            if (data.file_type.indexOf(fileTypes[item])) {
              fileTypes[item] = false;
            } else {
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
            var source = sourceArr[i].source;
            var indx = sourceArr[i].source.match('(%)')
            source = source.slice(++indx.index)
            indx = source.match('(%)')

            source = source.slice(++indx.index);
            source = source.split('.');
            source = source[0].split('24');
            var name = source[1];
            sourceArr[i].name = name;


            /*var fName = */
            if (fType == "Link") {
              $scope.links.push(sourceArr[i]);
              /*addSlide(target, sourceArr[i]);*/
            } else if (fType.indexOf('video') != -1) {
              $scope.video.push(sourceArr[i]);

              addSlide(target, sourceArr[i]); //carousel
            } else if (fType.indexOf('image') != -1) {

              $scope.images.push(sourceArr[i]);
              addSlide(target, sourceArr[i]); //carousel
            } else if (fType == "application/pdf" ||
              fType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
              $scope.documents.push(sourceArr[i]);
              /*addSlide(target, sourceArr[i]);*/
            } else continue;
          }
        }

        //delete aside btn
        $scope.asideOpened = false;
        vm.deleteAsideBtn = function(app) {
          $scope.asideOpened = false;
          $scope.currApp = app
          deleteAppAside.$promise.then(deleteAppAside.toggle);
        }
        vm.deleteRoleBtn = function() {
          /*$scope.roleData = data;*/
          deleteRoleAside.$promise.then(deleteRoleAside.toggle);
        }
        vm.deleteRoleBtn = function() {
          /*$scope.roleData = data;*/
          deleteRoleAside.$promise.then(deleteRoleAside.toggle);
        }
        vm.shareBtn = function() {
          shareRoleAside.$promise.then(shareRoleAside.toggle);
        }
        vm.editRoleBtn = function() {
          editRoleAside.$promise.then(editRoleAside.toggle);
        }

        $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
          if ($scope.viewApp) {
            vm.backBtn();
            event.preventDefault(); // This prevents the navigation from happening
          }
        });

        var MAXLENGTH = 430;
        $scope.descriptionLength = MAXLENGTH;
        vm.isTruncated = false;
        vm.toggleDescription = function() {
          vm.isTruncated = !vm.isTruncated;
          if (!vm.isTruncated) $scope.descriptionLength = MAXLENGTH;
          else {
            /*var numWord = vm.role.description.split(" ").length;*/
            $scope.descriptionLength = vm.role.description
          }
        }

      }

      return {
        restrict: 'E',
        scope: {
          role: '=',
          owner: '=',
          applicants: '=',
          usrinitial: '=',
          historyback: '&',
          getapps: '&'
        },
        templateUrl: 'app/views/pages/role_page.dir.html',
        link: link,
        controller: controller,
        controllerAs: 'vm',
        bindToController: true //required in 1.3+ with controllerAs

      }
    })

.controller('RolePageController',
    function(Applicant, Role, $location, $routeParams, $rootScope,
      $scope, $aside, $routeParams, $location, $route,
      $window, $timeout, $route, Meta, RoleService) {
      var vm = this;

      Role.get($routeParams.role_id)
        .success(function(data) {
          $rootScope.meta = Meta.prjMeta(data.project);

          if (data.client === "public") {
            $location.path('Apply/' + $routeParams.role_id)
            $location.replace();
          } else if (data.client === "owner") {
            vm.owner = true;
          } else vm.owner = false;

          vm.processing = false;
          $scope.roleData = data.data;
          if ($scope.roleData) {
            /*console.log("running getapps")*/
            getApps();
          }
        })
        .error(function(error) {
          console.log(error);
        })

      $scope.getApps = function() {
        getApps();
      }

      var getApps = function() {
        Applicant.getAll($routeParams.role_id)
          .success(function(data) {
            vm.processing = false;
            vm.applicants = data.data;
            $scope.numApps = data.data.length;
            //apply filters
            for (var i in vm.applicants) {
              var applicant = vm.applicants[i];
              applicant.numFavs = 0;

              //filter for new applicant
              if (applicant.userViewed_IDs.length === 0) {
                applicant.new = true;
              } else {
                for (var v in applicant.userViewed_IDs) {
                  var viewed = applicant.userViewed_IDs[v];
                  if (viewed.roleID === $scope.roleData._id &&
                    viewed.userID === $rootScope.user._id) {
                    applicant.new = false;
                  } else applicant.new = true;

                }

              }

              if (applicant && applicant.favs.length > 0) {
                for (var f in applicant.favs) {
                  var roleID = $routeParams.role_id
                  var appRoleID = applicant.favs[f].roleID;
                  //filter
                  if (roleID !== appRoleID) applicant.favs.splice(f, 1);
                  //check and assigned as favorited
                  /*if (applicant && applicant.favs[f] &&
                    $rootScope.user._id === applicant.favs[f].userID && $scope.roleData._id === applicant.favs[f].roleID) {
                    applicant.favorited = applicant.favs[f].favorited;
                  }*/
                  if(applicant.favs[f].favorited === true) applicant.numFavs++; 
                  if(applicant.numFavs > 0) applicant.favorited = true;
                  else applicant.favorited = false;
                }
              }

              //get headshot
              if (applicant.suppliments.length > 0) {
                for (var j in applicant.suppliments) {
                  if (applicant.suppliments[j].file_type.indexOf("image") === 0) {
                    applicant.headshot = applicant.suppliments[j].source;
                    break;
                  } else applicant.headshot = "/assets/imgs/img_headshot_placeholder.png";
                }
              }
              // no attachment
              else applicant.headshot = "/assets/imgs/img_headshot_placeholder.png";
            }
          })
          .error(function(error) {
            console.log(error);
          })
      }
    })
  .controller('shareRoleController', ['$scope', '$alert', '$location',
    '$timeout',
    function($scope, $alert, $location, $timeout) {
      //TODO: this is a temp fix for projeview-private,
      // table view role sharing
      $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
        $scope.$hide()
      });
      if ($scope.role) {
        $scope.roleData = $scope.role;
      }
      $scope.textToCopy = $scope.roleData.short_url;

      $scope.FB_text = "CASTING CALL: " + $scope.roleData.name +
        " \ " + $scope.roleData.description;

      $scope.Email_text = "Hey, \n \n \t I just created an acting role in BittyCasting that I thought might interest you. Check out the project and role by clicking the link:" + $scope.textToCopy + "\n \n Thanks!";

      $scope.Twitter_text = "CASTING CALL: " + $scope.roleData.name +
        " via " + " " + "@BittyCasting ";
      $scope.Twitter_url = $scope.roleData.short_url;

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
        $scope.$emit('aside.hide')
        $timeout(function() {
          $scope.$hide();
          $location.path(previewLink)
        }, 100)
      }
      $scope.success = function() {
        $scope.toggle = true;
        successAlert.toggle();
        $scope.textToCopy = "Copied."
        $timeout(function() {
          $scope.textToCopy = $scope.roleData.short_url;
        }, 1500);
      };

      $scope.fail = function(err) {
        console.error('Error!', err);
        errAlert.toggle();
      }
      return;
    }
  ])

.controller('CommentBoxCtrl',
  function($scope, $rootScope, Applicant) {
    var vm = this;
    vm.newComment = ""
    $scope.userID = $rootScope.user._id
      /*console.log($scope.userID)
      console.log()*/

    vm.deleteCmt = function(appID, index, comment) {
      Applicant.deleteComment(appID, comment)
        .success(function(data) {
          console.log(data)
          delete $scope.currApp.comments[index];
        })

    }

    vm.addCmt = function(appID, comment) {
      var owner = $rootScope.user.first[0] + $rootScope.user.last[0];
      var cmt = {
          timestamp: new Date(),
          owner: owner,
          ownerID: $rootScope.user._id,
          comment: comment
        }
        /*console.log(cmt)*/

      $scope.currApp.comments.push(cmt);
      Applicant.pushComment(appID, cmt)
        .success(function(data) {
          console.log(data)
          $scope.currApp.comments = data.comments
        })
      vm.newComment = "";
    }
  })