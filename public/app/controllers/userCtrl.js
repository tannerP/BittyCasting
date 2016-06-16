angular.module('userCtrl', ['userService'])

.controller('userController', function(User) {
	var vm = this;
	vm.processing = true;

	User.all()
		.success(function(data) {
			vm.processing = false;

			vm.users = data;
		})
		.error(function(err) {
			console.log(err)
		});

	vm.deleteUser = function(id) {
		vm.processing = true;

		User.delete(id)
			.success(function(data) {

				User.all()
					.success(function(data) {
						vm.processing = false;
						vm.users = data;
					});
			});
	}
})
.controller('signupInviteCtrl', 
	function(User, $scope, $location,$routeParams) {
	var vm = this;
	vm.userData = {};
	vm.type = 'create';

	vm.saveUser = function() {
		vm.processing = true;
		/*console.log("createUser");*/
		//clear the message
		vm.message = '';
		// use the create function in the userService
		User.createWithInvitation($routeParams.inviteID,vm.userData)
		.then(function(res){
			console.log(res)
			vm.message = res.data.message;
			console.log(vm.message)
			vm.processing = false;
			return;
		})
		return;
	}			
})

.controller('profileController',
	function($routeParams, User, Auth) {
		var vm = this;
		Auth.getUser()
			.then(function(data) {
				console.log(data)
				vm.userData = data.data;
				vm.userData.password = "";
			})
		vm.saveUser = function() {
			User.update(vm.userData._id, vm.userData)
				.success(function(data) {
					vm.processing = false;
					vm.message = data.message;
				});
		}
	})

.controller('userEditController_admin',
	function($routeParams, User) {
		var vm = this;
		vm.type = 'edit';
		User.get($routeParams.user_id)
			.success(function(data) {
				vm.userData = data;
			});

		vm.saveUser = function() {
			vm.processing = true;
			vm.message = '';

			User.update($routeParams.user_id, vm.userData)
				.success(function(data) {
					vm.processing = false;

					vm.userData = {};

					vm.message = data.message;
				});
		}
	})