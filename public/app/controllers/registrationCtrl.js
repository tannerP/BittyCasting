angular.module('registrationCtrl', ['authService', 'mgcrea.ngStrap'])

.controller('signupConfirmsSliderCtrl', function(User, $scope, $routeParams,
		$location, EmailConfirmation, EmailValidator, Facebook, $timeout,
		Auth, Project, Role, Applicant, $aside) {
		var vm = this;
		vm.send = function() {
			vm.message = "";
			EmailConfirmation.resend($routeParams.confirmID)
				.success(function(data, status, headers, config) {
					console.log(data)
					vm.message = data.message;
				})
				.error(function(data, status, headers, config) {
					console.log(data)
				})
		}

		vm.isEmailVallid = true;
		vm.emailChanging = function(email) {
			if (!email) return;
			vm.isEmailVallid = false;
			EmailValidator.validate(email, function(isvalid) {
				if (!isvalid) {
					vm.message = "Invalid Email";
				} else {
					vm.message = ""
				}
				return;
			})
		}
	})

	.controller('signupConfirmCtrl', function($scope, $routeParams,
		$location, Facebook, $timeout, Auth, User, Project, Role, Applicant, $aside) {
		var vm = this;
		vm.message = ""
		vm.email = "";

		var confirmSlider = $aside({
			scope: $scope,
			backdrop: "static",
			show: false,
			controller: 'signupConfirmsSliderCtrl',
			controllerAs: 'vm',
			templateUrl: '/app/views/pages/signup_confirm.tmpl.html'
		});


		Auth.confirmEmail($routeParams.confirmID)
			.success(function(data) {
				console.log(data)
				if (!data.success && data.invalid) {
					$location.path("/")
					$location.replace();
				} else if (data.success) {
					//create sample project
					var SAMPLE_PROJECT_ID = "571d2844618f2ca363dbef3c";
					//get sample project
					Project.get(SAMPLE_PROJECT_ID)
						.success(function(sampleProjectData) {
							//create sample project for applicant
							/*console.log(data)*/
							Project.create(sampleProjectData.project.project)
								.success(function(project) {
									for (var i in sampleProjectData.project.roles) {
										var role = sampleProjectData.project.roles[i]
										var roleIDs = []
										Role.create(project.projectID, role)
											.success(function(resp) {
												roleIDs.push(resp.roleID)
												if (roleIDs.length === sampleProjectData.project.roles.length) {
													Applicant.AddSampleProject(roleIDs.reverse())
														.success(function(data) {
															$location.path("/home");
															$location.replace();
														})
												}
											})
									}
								})
						})
				} else if (!data.success) {
					confirmSlider.show();
					$scope.message = data.message;
					/*console.log($scope.message)*/
				}
			})
		return vm;
	})

.controller('signupInviteSliderCtrl', function(User, $scope,
		$location, EmailValidator, Facebook, $routeParams, $aside) {
		var vm = this;

		vm.nameChanging = function(name) {
			/*console.log(name)*/
			var index = name.indexOf(" ");
			var fname = name.split(" ")[0];
			var lname = name.split(" ")[1];
			if (fname) {
				fname = fname[0].toUpperCase() + fname.toLowerCase().slice(1);
				vm.userData.name = fname;
			}
			if (lname) {
				lname = lname[0].toUpperCase() + lname.toLowerCase().slice(1);
			}

			if (lname && lname) {
				vm.userData.name = ''
				vm.userData.name = fname + " " + lname
			}
		}

		if ($location.path().indexOf('invite') > -1) vm.inviteReg = true;
		/*console.log($location.path())
		console.log(vm.inviteReg)*/

		vm.isEmailVallid = true;
		vm.emailChanging = function(email) {
			if (!email) return;
			vm.isEmailVallid = false;
			EmailValidator.validate(email, function(result) {
				vm.isEmailVallid = result;
				return;
			})
		}
		vm.checkFB = function() {
			Facebook.login(function(response) {
				/*		console.log(response)*/
				if (response.status === "connected") {
					Facebook.api('/me?fields=name,email', function(response) {
						/*console.log(response)*/
						vm.userData.name = response.name;
						vm.userData.email = response.email;
						return;
					});
				}
			}, {
				scope: 'email'
			});
			return;
		}

		vm.saveUser = function() {
			vm.processing = true;
			vm.message = '';
			User.createWithInvitation($routeParams.inviteID, vm.userData)
				.error(function(data) {
					vm.message = data.message;
				})
				.success(function(user) {
					/*console.log(user)*/
					if (!user.success) return vm.message = user.message;
					else {
						$scope.$emit('aside.hide')
							//clear the form
						$scope.hide();
						vm.userData = {};
						vm.processing = false;
						vm.message = "Successfully registered. Please log in to access your account."
						$location.path('/home');
						return;
					}
				});
		}
	})

	.controller('signupInviteCtrl', function(User, $scope,
		$location, EmailValidator, Facebook, $routeParams, $aside) {
		var vm = this;
		var signupAside = $aside({
			scope: $scope,
			backdrop: 'static',
			title: "Sign up",
			show: true,
			controller: 'signupInviteSliderCtrl',
			controllerAs: 'user',
			templateUrl: '/app/views/pages/signup.tmpl.html'
		})
	})

.controller('signupCtrl', function(User, $scope,
	$location, EmailValidator, Facebook) {
	var vm = this;
	vm.userData = {};
	vm.userData.name = "";
	vm.userData.email = "";
	vm.type = 'create';

	vm.checkFB = function() {
		Facebook.login(function(response) {
			/*console.log(response)*/
			if (response.status === "connected") {
				Facebook.api('/me?fields=name,email', function(response) {
					/*console.log(response)*/
					vm.userData.name = response.name;
					vm.userData.email = response.email;
					return;
				});
			}
		}, {
			scope: 'email'
		});
		return;
	}


	vm.nameChanging = function(name) {
		var index = name.indexOf(" ");
		var fname = name.split(" ")[0];
		var lname = name.split(" ")[1];

		if (fname) {
			fname = fname[0].toUpperCase() + fname.toLowerCase().slice(1);
			vm.userData.name = fname;
		}
		if (lname) {
			lname = lname[0].toUpperCase() + lname.toLowerCase().slice(1);
		}
		if (lname && lname) {
			vm.userData.name = ''
			vm.userData.name = fname + " " + lname
		}
	}

	vm.isEmailVallid = true;
	vm.emailChanging = function(email) {
		if (!email) return;
		/*vm.userData.email = email.split(" ").join("");*/
		/*console.log(vm.userData.emailChanging)*/

		vm.isEmailVallid = false;
		EmailValidator.validate(email, function(result) {
/*			console.log(result)*/
			vm.isEmailVallid = result;
			return;
		})
	}

	vm.saveUser = function() {
		vm.processing = true;
		vm.message = '';
		/*console.log(vm.userData)*/
		
		if(!vm.userData.email || !vm.isEmailVallid){
			vm.message = "Invalid email."
			return;
		}
		if(!vm.userData.name){
			vm.message = "Missing name."
			return;
		}
		if(!vm.userData.password){
			vm.message = "Missing password."; return;
		}

		User.create(vm.userData)
			.error(function(data) {
				vm.message = data.message;
			})
			.success(function(user) {
				if (!user.success) return vm.message = user.message;
				else {
					vm.message = user.message;
					vm.userData = {};
					setTimeout(function() {
						vm.processing = false;
						$scope.$emit('aside.hide')
						$scope.$hide();
						return;
					}, 7000)
				}
			});
	}
})