angular.module('mainCtrl', ['authService','mgcrea.ngStrap'])
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
										 	controller:'signupCtrl',	
										 	controllerAs:'user',					
										  templateUrl:'/app/views/pages/signup.html'										 				
										}) 											

   	vm.login = function(){
   			loginAside.$promise.then(loginAside.toggle);	
				}
		vm.signup = function(){
   			signupAside.$promise.then(signupAside.toggle);	
				}
	}])
	.controller('mainController',['$scope','Auth','$location',"$sce",
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
	}])
// controller applied to user creation page
	.controller('signupCtrl', function(User)	{
		var vm = this;

		// variable to hide/show elements of the view
		// differentiates between create or edit page
		vm.type = 'create';
		// function to create a user
		vm.saveUser = function()	{
			vm.processing = true;

			//clear the message
			vm.message = '';

			// use the create function in the userService
			User.create(vm.userData)
				.success(function (data)	{
					vm.processing = false;

					//clear the form
					vm.userData = {};
					vm.message = data.message;
				});

	}})

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

/* NAV */
.controller('navCtrl', ['$scope','$popover','$aside',
	function($scope,$popover,$aside){
		var vm = this;
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
										 	controller:'signupCtrl',	
										 	controllerAs:'project',					
										  templateUrl:'/app/views/pages/signup.html'										 				
										}) 	
		console.log("popover: "+ $popover);	
          
		vm.signin = function(){
			loginAside.toggle();
		}
		vm.signup = function(){
			signupAside.toggle();
		}
		vm.navCtrl;

	}])
.directive('nav', function() {
  return {
  	restrict:'A',
    templateUrl: 'components/nav/nav.tmpl.html'
  };
})
	
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