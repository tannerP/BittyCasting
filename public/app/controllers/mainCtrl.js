angular.module('mainCtrl', ['authService'])

	
	.controller('homeCtrl', ['$scope','$rootScope',function($scope, $rootScope){
		var vm = this;
		this.name = $rootScope.fullname
		console.log($rootScope.fullname);
		vm.message = 'HELLO';
	}])

	.controller('mainController',['$scope','Auth','$location','$rootScope','$route',
		function($rootScope,Auth,$location,$scope,$route) {
		var vm = this;
		vm.user={};

		vm.loggedIn = Auth.isLoggedIn();
		console.log(vm.user);


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
					Auth.getUser(function(data){
		 			$scope.user = data;
				});
				if (data.success) {
						$location.path('/home');
					}
				else vm.error = data.message;
			});
		};
		console.log($scope.user);
		//function to handle loggin out
		vm.doLogout = function () {
			Auth.logout();
			//reset all user info
			vm.user = {};
			$location.path('/login');
		}
	}]);





