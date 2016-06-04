angular.module('registrationCtrl', ['authService', 'mgcrea.ngStrap'])

.controller('signupConfirmCtrl', function(User, $scope, $routeParams,
		$location, EmailConfirmation, EmailValidator, Facebook, $timeout,
		Auth, Project, Role) {
		var vm = this;
		vm.message = ""
		vm.email = "";
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

		Auth.confirmEmail($routeParams.confirmID)
			.success(function(data) {
				if (data.success) {
					//create sample project
					var SAMPLE_PROJECT_ID = "57526e67f74b1db80d356ea0";
					//get sample project
					Project.get(SAMPLE_PROJECT_ID)
						.success(function(data) {
							//create sample project for applicant
							Project.create(data.project.project)
								.success(function(project) {
									for (var i in data.project.roles) {
										var role = data.project.roles[i]
										Role.create(project.projectID, role)
									}
								})
								//data.project.project
								//data.project.roles
							console.log(data)
						})
				}
				vm.message = data.message;
			})

		return vm;
	})
	.controller('signupInviteCtrl', function(User, $scope,
		$location, EmailValidator, Facebook, $routeParams) {
		var vm = this;
		vm.userData = {};
		vm.userData.name = "";
		vm.userData.email = "";
		vm.type = 'create';
		console.log("sign up ctrl")
		vm.checkFB = function() {
			Facebook.login(function(response) {
				/*		console.log(response)*/
				if (response.status === "connected") {
					Facebook.api('/me?fields=name,email', function(response) {
						/*						console.log(response)*/
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

			vm.isEmailVallid = false;
			EmailValidator.validate(email, function(result) {
				vm.isEmailVallid = result;
				return;
			})

		}


		vm.saveUser = function() {
			vm.processing = true;
			vm.message = '';
			User.createWithInvitation($routeParams.inviteID,vm.userData)
				.error(function(data) {
					vm.message = data.message;
				})
				.success(function(user) {
					console.log(user)
					if (!user.success) return vm.message = user.message;
					else {
						$scope.$emit('aside.hide')
						//clear the form
						vm.userData = {};
							vm.processing = false;
							vm.message = user.message;
							/*$location.path('/home')*/
							return;
					}
				});
		}
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
			/*		console.log(response)*/
			if (response.status === "connected") {
				Facebook.api('/me?fields=name,email', function(response) {
					/*						console.log(response)*/
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

		vm.isEmailVallid = false;
		EmailValidator.validate(email, function(result) {
			vm.isEmailVallid = result;
			return;
		})

	}


	vm.saveUser = function() {
		vm.processing = true;
		vm.message = '';
		User.create(vm.userData)
			.error(function(data) {
				vm.message = data.message;
			})
			.success(function(user) {
				console.log(user)
				if (!user.success) return vm.message = user.message;
				else {
					$scope.$emit('aside.hide')
					$scope.$hide();
					//clear the form
					vm.userData = {};
					setTimeout(function() {
						vm.processing = false;
						vm.message = user.message;
						/*$location.path('/login')*/
						return;
					}, 2000)
				}
			});
	}
})