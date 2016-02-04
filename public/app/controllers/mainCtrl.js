angular.module('mainCtrl', ['authService'])

	
	.controller('homeCtrl', ['$scope','$rootScope',function($scope, $rootScope){
		var vm = this;
		this.name = $rootScope.fullname
		console.log($rootScope.fullname);
		vm.message = 'HELLO';
	}])

	.controller('mainController',['$scope','Auth','$location','$rootScope',
		function($rootScope,Auth,$location,$scope) {
		var vm = this;
		$rootScope.userName;
		$rootScope.userID;
		//get info if a person is logged in
		vm.loggedIn = Auth.isLoggedIn();

		$scope.isActive = function (viewLocation) { 
	        return viewLocation === $location.path();
	    };

		//check to see if a user is logged in on every request
		$rootScope.$on('$routeChangeStart', function () {
			vm.loggedIn = Auth.isLoggedIn();
		});

	
		//function to handle login form
		vm.doLogin = function () {
			//processing Icon
			vm.processing = true;
			// clear error handling
			vm.error = '';

			// call the Auth.login() function
		Auth.login(vm.loginData.email, vm.loginData.password)
			.success(function (data) {
					vm.processing = false;

				if (data.success) {
						/*$rootScope.username = data.name;
						$rootScope.id =  data._id;*/
						$location.path('/home');
					//if a user successfully logs in, redirect to users page
					/*Auth.getUser()
						.then(function(data) {
							$rootScope.username = data.name;
							$rootScope.id =  data._id;
							$location.path('/home')
						 })*/
					}
				else vm.error = data.message;
			});
		};

		//function to handle loggin out
		vm.doLogout = function () {
			Auth.logout();
			//reset all user info
			vm.user = {};
			$location.path('/login');
		}
	}]);





