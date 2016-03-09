angular.module('mainCtrl', ['authService','mgcrea.ngStrap']).
controller('mainController',['$scope','$rootScope','Auth','$location',"$sce","$route",
		function($scope,$rootScope, Auth, $location, $sce, $route") {
		var vm = this;
		vm.loggedIn = false;
		vm.footer = true;
		vm.nav = true;

		$scope.$on('hideNavFooter', function(event,data){
			vm.footer = false;
			vm.nav = false;
		});

		vm.backBtn = function(){
			window.history.back();		}
		
	$scope.$on("LoggedIn", function(){
				Auth.getUser()
						.then(function(data) {
							vm.usrInitial = (data.name.first[0] + data.name.last[0]).toUpperCase();
						 })
		})
		$rootScope.$on('$routeChangeStart', function () {
			vm.loggedIn = Auth.isLoggedIn();
			vm.footer = true;
				vm.nav = true;

			if($location.path() === '/' ) vm.publicVw = true;
			else vm.publicVw = false;
			
			if(vm.loggedIn && !vm.name){
				Auth.getUser()
						.then(function(data) {
							if(data !=null){
							vm.usrInitial = data.name.first[0] + data.name.last[0];
							}
						 })
		}
		else 	if( $location.path().indexOf("/Apply") != -1)
			{
				vm.footer = false;
				vm.nav = false;
			}
		});
		vm.getUsrBtn = function(){
			$location.path('/profile');
		}

		vm.doLogout = function () {
			Auth.logout();
			vm.user = {};
			vm.usrInitial = '';
			$route.reload();
		}
	}]).
controller('signupCtrl', function(User,$scope,$location)	{
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
					setTimeout(function(){
						$location.path('/login')
					}, 2000)
					
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
					vm.loginData = {};
					
					//conditional for /login vs aside
					if($location.path() =='/login') $location.path('/home');
					else{
						$scope.$hide();
						$location.path('/home');}
					//this.user = 'name:unchanged';
					Auth.getUser()
						.then(function(data) {
							$scope.name = data.name;
							$scope.$emit("LoggedIn", data.name);
						 })
					}
				else vm.error = data.message;
			});
		};

	}]).

/* NAV */
controller('navCtrl', ['$scope','$popover','$aside','Auth','$location',
	function($scope,$popover,$aside,Auth,$location){
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
										  templateUrl:'/app/views/pages/login.tmpl.html'		
										});
		 	var	signupAside =  $aside({
											title:"Sign up",
											show: false, 
										 	controller:'signupCtrl',	
										 	controllerAs:'user',					
										  templateUrl:'/app/views/pages/signup.tmpl.html'										 				
										}) 	
          
		vm.signin = function(){
			loginAside.toggle();
		}
		vm.signup = function(){
			signupAside.toggle();
		}
		vm.navCtrl;
	}]);