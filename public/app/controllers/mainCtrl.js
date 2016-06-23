angular.module('mainCtrl', ['authService', 'mgcrea.ngStrap'])
	.controller('mainController', ['$scope', '$rootScope', 'Auth',
		'$location', "$sce", "$route", "$window", "Mail",
		"$aside", "Meta", "AuthToken", "$timeout", "EmailValidator",
		function($scope, $rootScope, Auth, $location, $sce,
			$route, $window, Mail, $aside, Meta, AuthToken,
			$timeout, EmailValidator) {
			var vm = this;
			$rootScope.meta = {};
			$scope.isAside = false;

			$scope.$on('aside.show', function() {
				$scope.isAside = true;
			})

			$scope.$on('aside.hide', function() {
				/*console.log("aside hiding")*/
				$scope.isAside = false;
			})
			$scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {

				if ($scope.isAside) {
					event.preventDefault();

				} // This prevents the navigation from happening
			});
			var FBLink = "https://www.facebook.com/BittyCasting-1053535994667037/"
			var twitterLink = " https://twitter.com/BittyCasting"

			vm.loggedIn = false;
			vm.footer = true;
			vm.nav = true;
			vm.navCollapsed = true;

			vm.loggedIn = Auth.isLoggedIn();

			vm.founder = (function() {
				if ($rootScope.user && $rootScope.user.role === "founder") return true;
				else return false;
			});

			$scope.$on('hideNav', function() {
				vm.nav = false;
			})
			$scope.$on('showNav', function() {
				vm.nav = true;
			})

			$scope.$on('hideFooter', function() {
				vm.footer = false;
			})
			$scope.$on('showFooter', function() {
				vm.footer = true;
			})

			$rootScope.$on('$routeChangeStart', function() {
				if ($rootScope.meta) $rootScope.meta = Meta.default();

				vm.navCollapsed = true;
				vm.loggedIn = Auth.isLoggedIn();
				vm.navCollapsed = true;
				vm.footer = true;
				vm.nav = true;

				//show footer & nav
				if ($location.path() === '/' ||
					$location.path() === '/login' ||
					$location.path() === '/signup') {
					vm.publicVw = true;
					vm.footer = true;
				}
				//hide nav
				else if ($location.path().indexOf('/Apply') != -1) {
					vm.nav = false;
				}
				//show header public view along with footer
				else if ($location.path() === '/Thankyou' ||
					$location.path() === '/privacy_policy' ||
					$location.path() === '/terms_of_service' ||
					$location.path() === '/submission_agreement') {
					vm.publicVw = false;
					vm.footer = true;
				} else { //hide nav public view & footer
					vm.publicVw = false;
					vm.footer = false;
				}
				if (vm.loggedIn && !vm.usrInitial) {
					Auth.getUser()
						.then(function(data) {
							if (data) {
								/*console.log(data)*/
								data = data.data;

								if (!data.name) {
									Auth.logout();
									$location.path('/')
									console.log("NO USER found")
								} else {
									vm.usrInitial = data.name.first[0] + data.name.last[0];
									if (data.role.indexOf("founder") != -1) {
										vm.admin = true;
									} else vm.admin = false;
									$rootScope.user = {
										first: data.name.first,
										last: data.name.last,
										email: data.email,
										role: data.role,
										invites: data.invites,
										notifications: data.notifcations,
										_id: data._id,
									}
								}
							}
						})
				}
			})
			vm.betaEmail;
			$scope.isSending = false;
			vm.betaRequestBtn = function() {
				$scope.isSending = true;
				/*$scope.$apply();*/
				if (vm.betaEmail) {
					$timeout(function() {
						$scope.isSending = false
					}, 1500)
					Mail.betaUser(vm.betaEmail);
					vm.betaEmail = null;
					vm.betaSubMessage = "Submitted! Thank you for your interest."
				}
			}
			var feedbackAside = $aside({
				scope: $scope,
				title: "Login",
				show: false,
				controller: 'feedbackCtrl',
				controllerAs: 'aside',
				templateUrl: '/app/views/pages/feedback.tmpl.html'
			});
			vm.feedbackBtn = function() {
				feedbackAside.toggle();
			}
			vm.backBtn = function() {
				$window.history.back();
			}
			vm.getUsrBtn = function() {
				$location.path('/profile');
			}
			vm.doLogout = function() {
				Auth.logout();
				vm.user = {};
				vm.usrInitial = '';
				$location.path('/');
				if ($location.path() === "/") $route.reload();
			}
			vm.twitter = function() {
				$window.open(twitterLink, '_blank');
			}
			vm.facebook = function() {
				$window.open(FBLink, '_blank');
			}
		}
	])

.controller("feedbackCtrl", ['$rootScope', '$scope', 'Mail',
	'$location',
	function($rootScope, $scope, Mail, $location) {
		var vm = this;
		$scope.feedback = {};
		vm.fb_master = {};
		vm.fb_master.user = {};

		vm.submit = function(feedback) {
			angular.copy(feedback, vm.fb_master);
			vm.fb_master.location = $location.path();
			vm.fb_master.timestamp = new Date().toLocaleString('en-US');
			vm.fb_master.user = $rootScope.user;

			console.log(vm.fb_master)
			Mail.sendFB(vm.fb_master);

			$scope.feedback = {};
			$scope.$hide()
		}
	}
])

.controller('loginCtrl', ['$scope', 'Auth', '$location', '$route',
		'EmailConfirmation',
		function($scope, Auth, $location, $route, EmailConfirmation) {
			var vm = this;
			vm.message;
			vm.loginData = {};
			vm.process = false;
			vm.resetPassword = false;
			vm.resendEmail = function(email) {
				EmailConfirmation.resend(email)
					.success(function(resp) {})
			}
			vm.doLogin = function(email, password) {
				vm.processing = true; //TODO:processing Icon
				vm.error = '';
				Auth.login(email, password)
					.success(function(data) {
						vm.processing = false;
						if (data.success) {
							vm.loginData = {};
							$scope.$emit('aside.hide')
							if ($location.path() == '/login') $location.path('/home');
							else {
								$location.path('/home');
								$scope.$hide();
							}
						} else {
							vm.error = data.message;
							if (data.notConfirmed) {
								vm.resendMode = true;
							}
						}

					});
			};

		}
	])
	.controller('newPassAsideCtrl', ['$scope', 'User', '$location', '$route', '$routeParams',
		function($scope, User, $location, $route, $routeParams) {
			var vm = this;
			var resetID = $routeParams.id;
			console.log(resetID)

			vm.processing = false;
			vm.submitBtn = function(pass1, pass2) {
				vm.processing = true;

				if (pass1.length < 8) {
					vm.message = "Weak password.";
					return
				}

				if (pass1 !== pass2) {
					vm.message = "Password doesn't match.";
					return
				} else {
					vm.message = ""
					User.newPass(resetID, pass1)
						.success(function(res) {
							vm.processing = false;
							console.log(data)
							vm.message = res.message
							return;
						})
				}
			}
		}
	])
	.controller('newPassCtrl', ['$scope', 'User', '$location', '$route', '$aside',
		function($scope, User, $location, $route, $aside) {
			var vm = this;
			vm.message;
			vm.loginData = {};
			vm.process = false;
			/*vm.resetPassword = false;*/

			var feedbackAside = $aside({
				show: true,
				backdrop: 'static',
				controller: 'newPassAsideCtrl',
				controllerAs: 'aside',
				templateUrl: '/app/views/pages/newPass.tmpl.html'
			});

			/*vm.submit*/

		return; }
	])
.controller('resetPassAsideCtrl', ['$scope', 'User', '$location', '$route',
	function($scope, User, $location, $route) {
		console.log("resetPassCtrl")
		var vm = this;
		vm.message;
		vm.loginData = {};
		vm.process = false;

		/*vm.message = "hello"*/

		vm.restBtn = function(email) {
			console.log("Button pressed")
			console.log(email)
			vm.processing = true; //TODO:processing Icon
			vm.error = '';
			User.resetPass(email)
				.success(function(data) {
					if (data.success)
						vm.message = data.message
					else {
						vm.error = data.message
						$scope.email = ""
					}
					vm.processing = false;
				});
		}
		return; }
])

/* NAV */
.controller('navCtrl', ['$scope', '$popover', '$aside', 'Auth', '$location',
	function($scope, $popover, $aside, Auth, $location) {
		var vm = this;
		$scope.email = "";
		$scope.password = "";

		vm.isActive = function(viewLocation) {
			return viewLocation === $location.path();
		};

		var loginAside = $aside({
			scope: $scope,
			title: "Login",
			show: false,
			controller: 'loginCtrl',
			controllerAs: 'login',
			templateUrl: '/app/views/pages/login.tmpl.html'
		});
		var signupAside = $aside({
			scope: $scope,
			title: "Sign up",
			show: false,
			controller: 'signupCtrl',
			controllerAs: 'user',
			templateUrl: '/app/views/pages/signup.tmpl.html'
		})
		var resetAside = $aside({
			scope: $scope,
			show: false,
			controller: 'resetPassAsideCtrl',
			controllerAs: 'aside',
			templateUrl: '/app/views/pages/resetPass.tmpl.html'
		})

		vm.resetPass = function() {
			resetAside.toggle();
			setTimeout(function() { //close aside after 1 sec
				loginAside.hide();
			}, 500);
			$scope.navCollapsed = true; //make sure nav is closed
		}
		vm.signin = function() {
			loginAside.toggle();
			setTimeout(function() { //close aside after 1 sec
				resetAside.hide();
				signupAside.hide();
			}, 500);
			$scope.navCollapsed = true; //make sure nav is closed
		}
		vm.signup = function() {
			signupAside.toggle();
			setTimeout(function() { //close aside after 1 sec
				loginAside.hide();
			}, 500);
			$scope.navCollapsed = true; //make sure nav is closed
		}
		vm.navCtrl;
	}
]);