angular.module('projectCtrl',['userService', 'mgcrea.ngStrap']).
		controller('home_ProjectsController', 
		function(Project, $location, $aside)	{
				var vm = this;
				vm.newPart = function(){
				newPartAside.toggle();
				}
				Project.getAll()
				.success(function(data){
				vm.processing = false;
				vm.projects = data.data;
			})
			var newPartAside = $aside({
					title:"Login",
					show: false, 
				 	controller:'newProjectController',
				 	controllerAs:'part',						
				  templateUrl:'/app/views/pages/project_form.html'		
				});
			newPartAside.$promise.then(function() {
	    newPartAside.hide();
	  	})
		}).
	controller('edit_RoleController',
	 function(Role, $location, $routeParams){
		var vm = this;
		vm.edit = true;
		vm.processing = true;
		vm.roleData = {};
		/*vm.roleData.headshot = false;
		vm.roleData.resume = false;
		vm.roleData.CS = false;
		vm.roleData.auditionVideo = false;
		vm.roleData.monologue = false;*/
		Role.get($routeParams.role_id)
			.success(function(data){
				vm.processing = false;
				vm.roleData = data.data;
			})
			.error(function(err){
				console.log(err);
			})

		vm.updateRole = function(){
			Role.update($routeParams.role_id,vm.roleData)
				.success(function(){
					vm.processing = false;
					window.history.back();
				})
				.error(function(err){
					console.log(err.message);
				})
	}}).

	controller('add_RoleController',
	 function(Role, $location, $routeParams){
		var vm = this;
		vm.edit = false;
		vm.roleData = {};
		vm.project_id = $routeParams.project_id;
		vm.createRole = function(){
			console.log("project ID :" + vm.project_id);
			
			vm.roleData.projectID = $routeParams.project_id;
			
			Role.create($routeParams.project_id,vm.roleData)
				.success(function(){
					window.history.back();
				})
				.error(function(err){
					console.log(err.message);
				})
	}}).
