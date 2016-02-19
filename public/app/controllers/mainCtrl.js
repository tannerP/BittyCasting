angular.module('mainCtrl', ['authService','mgcrea.ngStrap'])
	.controller('navController',['$scope','$location','$aside','$popover' ,'Auth',
		function($scope,$aside,$location,Auth){
		var vm = this;
		vm.loggedIn = Auth.isLoggedIn();
				vm.isActive = function (viewLocation) { 
	        return viewLocation === $location.path();
	    };
		vm.message = " hey there";
		vm.test = function(){
   	var myAside = $aside({title: 'My mainController', content: 'My Content'});	
   		}
	}])
	.controller('mainController',['$scope','Auth','$location',
		function($rootScope, Auth, $location, $scope ) {
		var vm = this;

		vm.loggedIn = Auth.isLoggedIn();

		$rootScope.$on('$routeChangeStart', function () {
			vm.loggedIn = Auth.isLoggedIn();
		});

		
		vm.doLogout = function () {
			Auth.logout();
			vm.user = {};
			$location.path('/');
		}
	}])

.controller('loginCtrl',['$scope','Auth','$location',
	function($scope,Auth,$location){
			var vm = this;
			vm.message;
			vm.process = false;
			vm.doLogin = function () {
			vm.processing = true; //TODO:processing Icon
			vm.error = '';
			Auth.login(vm.loginData.email, vm.loginData.password)
				.success(function (data) {
					vm.processing = false;
					Auth.getUser(function(data){
		 			$scope.user = data;
				});
				if (data.success) {
						$location.path('/home');
					}
				else vm.error = data.message;
			});
		};
	}])

.controller('publicCtrl', ['$scope','$aside',
		function($scope,$aside){
		$scope.customer = {
    name: 'Naomi',
    address: '1600 Amphitheatre'
  	}
		
		var vm = this;
		vm.message = "publicCtrl"
   	var loginAside = $aside({
											title:"Login",
											show: false, 
										 	controller:'loginCtrl',
										 	controllerAs:'login',						
										  templateUrl:'/app/views/pages/login.html'		
										});
		var	signupAside =  $aside({scope:$scope,
											title:"Sign up",
											show: false, 
										 	controller:'loginCtrl',						
										  templateUrl:'/app/views/pages/signup.html'										 				
										}) 											

   	vm.login = function(){
   			loginAside.$promise.then(loginAside.toggle);	
				}
		vm.signup = function(){
   			signupAside.$promise.then(signupAside.toggle);	
				}
	}])

/* NAV */
.controller('navCtrl', ['$scope','$popover',
	function($scope,$popover){
		console.log($popover);	
	/*	var myPopover = $popover(element, {
                    title: 'My Title',
                    contentTemplate: 'example.html',
                    html: true,
                    trigger: 'manual',
                    autoClose: true,
                    scope: scope
                });*/                
		var vm = this;
		vm.test = function(){
			myPopover.show()	;
		}
		vm.navCtrl;

	}])
.directive('nav', function() {
  return {
  	restrict:'A',
    templateUrl: 'components/nav/nav.tmpl.html'
  };
});


