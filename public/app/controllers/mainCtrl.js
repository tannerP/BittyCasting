angular.module('mainCtrl', ['authService','mgcrea.ngStrap']).
controller('mainController',['$scope','$rootScope','Auth',
	'$location',"$sce","$route","$window","Mail",
		function($scope,$rootScope, Auth, $location, $sce, $route, $window,Mail) {
		var vm = this;

		var FBLink = "https://www.facebook.com/BittyCasting-1053535994667037/"
		var twitterLink =" https://twitter.com/BittyCasting"
		vm.loggedIn = false;
		vm.footer = true;
		vm.nav = true;
		vm.navCollapsed = true;
		$scope.coverPhotos = [
		'assets/imgs/img_projectCover01.png',
		'assets/imgs/img_projectCover02.png',
		'assets/imgs/img_projectCover03.png',
		'assets/imgs/img_projectCover04.png',
		'assets/imgs/img_projectCover05.png'
		];

		vm.loggedIn = Auth.isLoggedIn();
		vm.backBtn = function(){
			if(vm.nav === false) vm.nav = true;
			window.history.back();		
		}
		$scope.$on("LoggedIn", function(){
				Auth.getUser()
						.then(function(data) {
							vm.usrInitial = (data.name.first[0] + data.name.last[0]).toUpperCase();
						 })
		})
		$scope.$on("hideNav", function(){
			vm.nav = false;
		})
		$scope.$on("unhideNav", function(){
			vm.nav = true;
		})
		
		$rootScope.$on('$routeChangeStart', function () {
			vm.navCollapsed = true;
			vm.loggedIn = Auth.isLoggedIn();
			vm.navCollapsed = true;
			vm.footer = true;
			vm.nav = true;

			if($location.path() === '/' ||
				$location.path() === '/login' ||
				$location.path() === '/privacy_policy' ||
				$location.path() === '/terms_of_service' ||
				$location.path() === '/submission_agreement' ||
				$location.path() === '/signup'){
				vm.publicVw = true;
				vm.footer = true;
			}
			else if($location.path() === '/Thankyou'){
				vm.publicVw = false;
				vm.footer = true;
			}
			else{
			 vm.publicVw = false;
			 vm.footer = false;
			}
			if(vm.loggedIn && !vm.name){
				Auth.getUser()
						.then(function(data) {
							if(data !=null){
							vm.usrInitial = data.name.first[0] + data.name.last[0];
							vm.username ={first:data.name.first,
														last:data.name.last}
							}
						 })
			}
		})
		vm.betaEmail;
	vm.betaRequestBtn = function(email)
	{
		console.log(vm.betaEmail)
		Mail.betaUser(vm.betaEmail);
	}	
	vm.getUsrBtn = function(){
			$location.path('/profile');
		}
		vm.doLogout = function () {
			Auth.logout();
			vm.user = {};
			vm.usrInitial = '';
			$location.path('/');
			/*$route.reload();*/
		}
		vm.twitter = function(){
			$window.open(twitterLink,'_blank');
		}
		vm.facebook = function(){
			$window.open(FBLink,'_blank');
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
			vm.doLogin = function (email, password) {
				vm.processing = true; //TODO:processing Icon
				vm.error = '';
				Auth.login(email, password)
					.success(function (data) {
						vm.processing = false;

					if (data.success) {
						//if a user successfully logs in, redirect to users page
						vm.loginData = {};
						
						//conditional for /login vs aside
						if($location.path() =='/login') $location.path('/home');
						else{
							$location.path('/home');}
							$scope.$toggle();
						//this.user = 'name:unchanged';
						/*Auth.getUser()
							.then(function(data) {
								$scope.name = data.name;
								$scope.$emit("LoggedIn", data.name);
							 })*/
						}
					else vm.error = data.message;
				});
			};

	}]).

/* NAV */
controller('navCtrl', ['$scope','$popover','$aside','Auth','$location',
	function($scope,$popover,$aside,Auth,$location){
		var vm = this;
		$scope.email = "";
		$scope.password = "";

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
		 									scope:$scope,
											title:"Sign up",
											show: false, 
										 	controller:'signupCtrl',	
										 	controllerAs:'user',					
										  templateUrl:'/app/views/pages/signup.tmpl.html'										 				
										}) 	
          
		vm.signin = function(){
			console.log("btn pressed")	
			loginAside.toggle();
			setTimeout(function(){	//close aside after 1 sec
				signupAside.hide();
			},500);
			$scope.navCollapsed = true; //make sure nav is closed
		}
		vm.signup = function(){		
			console.log("btn 2 pressed")	
			signupAside.toggle();
			setTimeout(function(){	//close aside after 1 sec
				loginAside.hide();	
			},500);
			$scope.navCollapsed = true; //make sure nav is closed
		}
		vm.navCtrl;
	}]);