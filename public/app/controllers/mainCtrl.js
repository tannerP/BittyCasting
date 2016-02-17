angular.module('mainCtrl', ['authService'])

	
	.controller('homeCtrl', ['$scope','$rootScope',function($scope, $rootScope){
		var vm = this;
		this.name = $rootScope.fullname
		console.log($rootScope.fullname);
		vm.message = 'HELLO';
	}])

	.controller('mainController',['$scope','Auth','$location','$rootScope','$aside',
		function($rootScope,Auth,$location,$scope,$route,$aside) {
		var vm = this;
		vm.user={};

		vm.loggedIn = Auth.isLoggedIn();

		$scope.isActive = function (viewLocation) { 
	        return viewLocation === $location.path();
	    };

		$rootScope.$on('$routeChangeStart', function () {
			vm.loggedIn = Auth.isLoggedIn();
		});
		vm.test = function(){
			var aside = $aside({title: 'My Title', content: 'My Content', show: true});
		}
		vm.doLogin = function () {
			//TODO:processing Icon
			vm.processing = true;
			vm.error = '';

		Auth.login(vm.loginData.email, vm.loginData.password)
			.success(function (data) {
					vm.processing = false;
					Auth.getUser(function(data){
		 			$scope.user = data;jkjk
				});
				if (data.success) {
						$location.path('/home');
					}
				else vm.error = data.message;
			});
		};
		console.log($scope.user);

		vm.doLogout = function () {
			Auth.logout();
			vm.user = {};
			$location.path('/login');
		}
	}]);





