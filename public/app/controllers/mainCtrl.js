angular.module('mainCtrl', ['authService','mgcrea.ngStrap']).
controller('mainController',['$scope','Auth','$location',"$sce",
		function($rootScope, Auth, $location, $scope, $sce ) {
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
	}]).
controller('signupCtrl', function(User)	{
		var vm = this;
		vm.userData={};
		vm.type = 'create';

		vm.saveUser = function()	{
			vm.processing = true;
			console.log("createUser");
			//clear the message
			vm.message = '';
			// use the create function in the userService
			User.create(vm.userData)
				.success(function (data)	{
					vm.processing = false;
					$scope.$hide();
					//clear the form
					vm.userData = {};
					vm.message = data.message;
				});

	}}).
controller('loginCtrl',['$scope','Auth','$location',
	function($scope,Auth,$location){
			var vm = this;
			vm.message;
			vm.loginData = {};
			vm.process = false;
			vm.doLogin = function () {
			vm.processing = true; //TODO:processing Icon
			vm.error = '';
			Auth.login(vm.loginData.email, vm.loginData.password)
				.success(function (data) {
					vm.processing = false;
					vm.loginData = {};
				//	$scope.$hide();
					Auth.getUser(function(data){
		 			$scope.user = data;
				});
				if (data.success) {
						$location.path('/home');
					}
				else vm.error = data.message;
			});
		};
	}]).

/* NAV */
controller('navCtrl', ['$scope','$popover','$aside','Auth',
	function($scope,$popover,$aside,Auth){
		var vm = this;
		vm.loggedIn = Auth.isLoggedIn();
		vm.isActive = function (viewLocation) { 
	        return viewLocation === $location.path();
	    };
		 var loginAside = $aside({
											title:"Login",
											show: false, 
										 	controller:'loginCtrl',
										 	controllerAs:'login',						
										  templateUrl:'/app/views/pages/login.html'		
										});
		 	var	signupAside =  $aside({
											title:"Sign up",
											show: false, 
										 	controller:'signupCtrl',	
										 	controllerAs:'user',					
										  templateUrl:'/app/views/pages/signup.html'										 				
										}) 	
          
		vm.signin = function(){
			loginAside.toggle();
		}
		vm.signup = function(){
			signupAside.toggle();
		}
		vm.navCtrl;

	}]).
directive('nav', function() {
  return {
  	restrict:'A',
    templateUrl: 'components/nav/nav.tmpl.html'
  };
});