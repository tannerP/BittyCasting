angular.module('mainCtrl', ['authService','mgcrea.ngStrap'])
.controller('mainController',['$scope','$rootScope','Auth',
	'$location',"$sce","$route","$window","Mail","$aside",
		function($scope,$rootScope, Auth, $location, $sce, $route, $window,Mail,$aside) {
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
		vm.founder = (function(){
					console.log($rootScope.user.role)
						if ($rootScope.user.role === "founder")
							/*return true;*/
							console.log('Founder!!')
						else
							return false;
					});
		
		$rootScope.$on('$routeChangeStart', function () {
			vm.navCollapsed = true;
			vm.loggedIn = Auth.isLoggedIn();
			vm.navCollapsed = true;
			vm.footer = true;
			vm.nav = true;

			if($location.path() === '/' ||
				$location.path() === '/login' ||
				$location.path() === '/signup'){
				vm.publicVw = true;
				vm.footer = true;
			}
			else if($location.path().indexOf('/Apply') != -1){
						vm.nav = false;				
			}
			else if($location.path() === '/Thankyou' ||
				$location.path() === '/privacy_policy' ||
				$location.path() === '/terms_of_service' ||
				$location.path() === '/submission_agreement'){
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
							if(data){
							vm.usrInitial = data.name.first[0] + data.name.last[0];
							console.log(data);
							if(data.role.indexOf("founder") != -1){vm.admin = true;}
							else vm.admin = false;
							$rootScope.user ={first:data.name.first,
																last:data.name.last,
																email:data.email,
																role:data.role,
													}
							}
						 })
			}
		})
		vm.betaEmail;
	vm.betaRequestBtn = function(email)
	{
		if(vm.betaEmail){
			Mail.betaUser(vm.betaEmail);
			vm.betaEmail = null;
			vm.betaSubMessage = "Submitted! Thank you for your interest"
		}


	}	
	var feedbackAside = $aside({
	 									scope:$scope,
										title:"Login",
										show: false, 
									 	controller:'feedbackCtrl',
									 	controllerAs:'aside',						
									  templateUrl:'/app/views/pages/feedback.tmpl.html'		
									});
	vm.feedbackBtn = function (){
		feedbackAside.toggle();
	}
	vm.backBtn = function (){
		  $window.history.back();
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

	}])

.controller("feedbackCtrl", ['$rootScope','$scope','Mail',
	'$location',function($rootScope, $scope, Mail, $location){
	var vm = this;
	$scope.feedback = {};
	vm.fb_master = {};
	vm.fb_master.user = {};
	/*console.log($location.path());*/
	/*console.log($rootScope.user);*/

	vm.submit = function(feedback){
		angular.copy(feedback,vm.fb_master);
		vm.fb_master.location = $location.path();
		vm.fb_master.timestamp = new Date();
		vm.fb_master.user = $rootScope.user;
		
		Mail.sendFB(vm.fb_master);

		$scope.feedback = {};		
		$scope.$hide()
	}

}])

/* NAV */
.controller('navCtrl', ['$scope','$popover','$aside','Auth','$location',
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
			loginAside.toggle();
			setTimeout(function(){	//close aside after 1 sec
				signupAside.hide();
			},500);
			$scope.navCollapsed = true; //make sure nav is closed
		}
		vm.signup = function(){		
			signupAside.toggle();
			setTimeout(function(){	//close aside after 1 sec
				loginAside.hide();	
			},500);
			$scope.navCollapsed = true; //make sure nav is closed
		}
		vm.navCtrl;
	}]);