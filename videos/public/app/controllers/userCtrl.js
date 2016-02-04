//inject the stuff service into main Angular module
angular.module('userCtrl',['userService'])

	.controller('userController',function(User)	{
		var vm = this;
		//	set a processing variable to show loading things
		vm.processing = true;

		//	grab all the users at page load
		User.all()
		.success(function(data)	{	
			vm.processing = false;
			vm.users = data;
		})
		.error(function(err){
			console.log(err)
		});
		
		function deleteUser(id)	{
			vm.processing = true;
			User.delete(id)
				.success(function(data)	{
					User.all()
						.success(function(data)	{
							vm.processing = false;
							vm.users = data;
							});
						});
	}})

// controller applied to user creation page
	.controller('userCreateController', function(User)	{
		var vm = this;

		// variable to hide/show elements of the view
		// differentiates between create or edit page
		vm.type = 'create';
		// function to create a user
		vm.saveUser = function()	{
			vm.processing = true;

			//clear the message
			vm.message = '';

			// use the create function in the userService
			User.create(vm.userData)
				.success(function (data)	{
					vm.processing = false;

					//clear the form
					vm.userData = {};
					vm.message = data.message;
				});

	}})
	//	controller applied to user edit page
	.controller('userEditController', function($routeParams,User)	{
		var vm = this;
			//	variable to hide/show elemments of the view
			//	differentiates between create or edit pages
		vm.type = 'edit';

			//	get the user data for the user you want to edit
			//	$routeParams is the way we grab data from the URL
		User.get($routeParams.user_id)
			.success(function(data)	{
				vm.userData = data;
			});

			//	function to save the user
		vm.saveUser = function() {
			vm.processing = true;
			vm.message = '';

		//	call the userService function to update
		User.update($routeParams.user_id, vm.userData)
				.success(function(data) {
					vm.processing = false;

					//clear the form
					vm.userData = {};

					//bind the message from API to vm.message
					vm.message = data.message;
				});
	}})