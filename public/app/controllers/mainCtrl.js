angular.module('mainCtrl', ['authService','mgcrea.ngStrap']).
controller('mainController',['$scope','$rootScope','Auth','$location',"$sce",
		function($scope,$rootScope, Auth, $location, $scope, $sce) {
		var vm = this;
		vm.message = "HEY THERE";
		vm.loggedIn = false;
		/*$scope.$on("loggedIn", function(){
			console.log("Got event");
		})*/
		if(vm.loggedIn){
			vm.user = Auth.getUser();
		}
		 /*vm.user = Auth.getUser(function(data){
				vm.user = data;
				/*console.log(vm.user);
				});		
		 console.log(vm.user);*/
		 /*vm.$watch("vm.loggedIn", function(newValue, oldValue) {
			  console.log(newValue);
			  console.log(oldValue);
			});*/

		$rootScope.$on('$routeChangeStart', function () {
			vm.loggedIn = Auth.isLoggedIn();
		});
		
		vm.doLogout = function () {
			Auth.logout();
			vm.user = {};
			$location.path('/');
		}
	}]).
controller('signupCtrl', function(User,$scope)	{
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
controller('loginCtrl',['$scope','Auth','$location','$route',
	function($scope,Auth,$location,$route){
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

				if (data.success) {
					//if a user successfully logs in, redirect to users page
					$location.path('/home');
					$route.reload();
					vm.loginData = null;
					//this.user = 'name:unchanged';
					Auth.getUser()
						.then(function(data) {
							$scope.name = data.name;
						 })
					}
				else vm.error = data.message;
			});
		};

	}]).

/* NAV */
controller('navCtrl', ['$scope','$popover','$aside','Auth',
	function($scope,$popover,$aside,Auth){
		var vm = this;
		vm.isActive = function (viewLocation) { 
	        return viewLocation === $location.path();
	    };
		 var loginAside = $aside({
		 									scope:$scope,
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