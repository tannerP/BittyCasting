angular.module('projectCtrl',['userService'])

	//role_form
	.controller('roleFormController', function(Role, $location, $routeParams){
		var vm = this;
		vm.processing = true;
		vm.roleData = {};
		/*vm.roleData.headshot = false;
		vm.roleData.resume = false;
		vm.roleData.CS = false;
		vm.roleData.auditionVideo = false;
		vm.roleData.monologue = false;*/

		vm.createRole = function(){
			console.log(JSON.stringify(vm.roleData));
			Role.create($routeParams.project_id,vm.roleData)
				.success(function(){
					window.history.back();
				})
				.error(function(err){
					console.log(err.message);
				})
	}})

		//Profile.html
	.controller('loadProjectsController', function(Project, $location)	{
		var vm = this;
		vm.processing = true;
		vm.projects;
		Project.getAll()
			.success(function(data){
				vm.processing = false;
				vm.projects = data;
			})
	    //TODO should be a directive			
		vm.getProject = function(projectID)	{
			vm.projectID;
			Project.get(projectID)
			.success(function(data){
					$location.path("/castings")
				})
			.error(function(err){
				vm.message = err;
			});
	}})
	//casting.html
	.controller('projectcastingsController', function(Project, $location, $routeParams){
		var vm = this;
		vm.processing = true;
		vm.projectData;
		vm.proj_id = $routeParams.project_id;
		console.log('Enter Project Castings Controller');


		Project.get(vm.proj_id)
		.success(function(data){
			vm.processing = false;
			vm.projectData = data.project
			console.log(JSON.stringify(data));
		})
		.error(function(){
			console.log(error);
		})


		vm.save = function(){
			vm.processing = true;
			vm.message;
			Character.save(vm.charData)
			.success(function(data)	{
					vm.processing = false;
					vm.projectData = {};
					vm.message = data.message;
					$location.path('/profile'); //need create a variable to keep track of current project. 

			});
	}})
	//project.html
	.controller('newProjectController', function(Project, $location)	{
		var vm = this;
		vm.existing = false;
		vm.processing = true;
		vm.projectData;
		vm.save = function(){
			vm. processing = true;
			vm.message;
			Project.create(vm.projectData)
				.success(function(data)	{
					vm.processing = false;
					vm.projectData = {};
					vm.message = data.message;
					$location.path('/profile');

				});

		}})

	//page: project.html
	.controller('saveEdittingProjectController', function(Project,$location,$routeParams)	{
		var vm = this;
		vm.existing = true;
		vm.processing = true;
		vm.projectData;
		vm.proj_id = $routeParams.project_id;
		Project.get(vm.proj_id)
		.success(function(data){
			vm.processing = false;
			vm.projectData = data.project
			console.log(JSON.stringify(data));
		})
		.error(function(){
			console.log(error);
		})

		vm.save = function(){
			vm. processing = true;
			vm.message;	
		Project.update(vm.proj_id, vm.projectData)
			.success(function(data){
				vm.processing  = false;
				vm.projectData = null;
				$location.path('/profile');

			 })
			.error(function(err){
				console.log(err);
			});

	}})
	//Change to style.flexDirection = 'column-reverse' 
	.controller('delete_project',function(Project,$location)	{
		var vm = this; 
		vm.process = true;
		vm.existing = true;
		vm.rolls = [];
		
		vm.delete = function(projID) {
			console.log('Deleting prodID:' + projID);
			Project.delete(projID)
			.success(function(){
				$location.path('/profile');
				vm.processing = false;
				vm.projectData = null;

				/*$location.path('/profile');*/

			})
			.error(function(err){
				console.log(err);}
				)
	}})