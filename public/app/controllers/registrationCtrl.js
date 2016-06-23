angular.module('registrationCtrl', ['authService', 'mgcrea.ngStrap'])

.controller('signupConfirmSliderCtrl', function(User, $scope, $routeParams,
	$location, EmailConfirmation, EmailValidator, Facebook, $timeout,
	Auth, Project, Role, Applicant, $aside) {
	var vm = this;
	vm.send = function() {
		vm.message = "";
		EmailConfirmation.resend($routeParams.confirmID)
			.success(function(data, status, headers, config) {
				/*console.log(data)*/
				vm.message = data.message;
			})
			.error(function(data, status, headers, config) {
				/*console.log(data)*/
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
		controller: 'signupConfirmSliderCtrl',
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
	$location, EmailValidator, Facebook, $routeParams, $timeout,
	$aside, Auth) {
	var vm = this;

/*	vm.nameChanging = function(name) {
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
	}*/

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
			.success(function(resp) {
				/*console.log(resp)*/
				if (!resp.success) return vm.message = resp.message;
				else {
					Auth.setToken(resp, function() {
						vm.userData = {};
						vm.processing = false;
						vm.message = "Successfully registered. You are being directed to the project."
						$timeout(function() {
							$scope.$emit('aside.hide')
							$scope.$hide();
							$location.path('/home');
							return;
						}, 2500)
					});
				}
			});
	}
})

.controller('resetPassCtrl', function(User, $scope,
	$location, $routeParams, $aside) {
	var vm = this;
	var signupAside = $aside({
		scope: $scope,
		backdrop: 'static',
		title: "Password Reset",
		show: true,
		controller: 'signupInviteSliderCtrl',
		controllerAs: 'user',
		templateUrl: '/app/views/pages/resetPass.tmpl.html'
	})
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

	var isLastKeySpace = true;
	vm.nameKeyDown = function(name, event) {
		//prevent defaul
			console.log(event)
			console.log(name.length)
			console.log(name)
			if(name && name.length === 0){
				console.log(name)
				console.log(name.toUpperCase())
				name = name.toUpperCase()
				return;
			}
			if (isLastKeySpace === true) {
				//last key pressed was a space
				//capitalize following word
				//extract last word capitalize, then concat back
				/*console.log(name)
				console.log(name.length)
				console.log(name.substring(--name.length,name.length))*/
				isLastKeySpace = false;
			}
			//if last key is a space 
			//next word should be capitalized
			else if (event.which === 32) {
				/*console.log("space key")*/
				isLastKeySpace = true;
			} else {
				/*console.log("regular")*/
				isLastKeySpace = false;
				return;
			}



		}
		/*
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
			}*/

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

		if (!vm.userData.email || !vm.isEmailVallid) {
			vm.message = "Invalid email."
			return;
		}
		if (!vm.userData.name) {
			vm.message = "Missing name."
			return;
		}
		if (!vm.userData.password) {
			vm.message = "Missing password.";
			return;
		}

		User.create(vm.userData)
			.error(function(data) {
				vm.message = data.message;
			})
			.success(function(resp) {
				if (!resp.success) return vm.message = resp.message;
				else {
					vm.message = resp.message;
					vm.userData = {};
					setTimeout(function() {
						vm.processing = false;
						$scope.$emit('aside.hide')
						$scope.$hide();
						return;
					}, 5000)
				}
			});
	}
})