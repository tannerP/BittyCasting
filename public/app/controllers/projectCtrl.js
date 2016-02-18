angular.module('projectCtrl',['userService', 'mgcrea.ngStrap'])

	/*.controller('AMM', function(){
		var vm = this;
		vm.message = 'AMM';
	})
	*/
	.controller('edit_RoleController', function(Role, $location, $routeParams){
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
	}})

	.controller('add_RoleController', function(Role, $location, $routeParams){
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
	}})

//home.html
	.controller('home_ProjectsController', function(Project, $location, $aside)	{
		var vm = this;
		var newPrjAside =  $aside({
											title:"Login",
											show: false, 
										 	controller:'loginCtrl',
										 	controllerAs:'login',						
										  templateUrl:'/app/views/pages/project_form.html'		
										});

		vm.processing = true;
		vm.projects;
		
		vm.test = function(){
			newPrjAside.toggle();
			console.log("click click");
		}

		Project.getAll()
			.success(function(data){
				vm.processing = false;
				vm.projects = data.data;
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

//CastingBoard.html
	.controller('CastingBoardController', function(Role, Project ,$location, $routeParams){
		var vm = this;
		vm.processing = true;
		vm.Roles  = [];
		vm.project_id = $routeParams.project_id;
		vm.project = {};

		Project.get(vm.project_id)
			.success(function(data){
					console.log(data.project);
					vm.project = data.project;
				})
			.error(function(err){
				vm.message = err;
			});
		
		console.log('Enter Project Castings Controller, Role ID: '+ vm.project_id);
		//Get roles from project
		Role.getAll(({'data':$routeParams.project_id}))
		.success(function(data){
			vm.processing = false;
			vm.Roles = data.data;
			var temp =  JSON.stringify(data.data);
			console.log(data.data[0]);
			console.log(typeof temp);			
		})
		.error(function(error){
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
					$location.path('/project/' + $routeParams.project_id); 

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
					$location.path('/home');

				});

		}})

	//page: project.html
	.controller('edit_ProjectController', function(Project,$location,$routeParams)	{
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
				$location.path('/home');

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
				$location.path('/home');
				vm.processing = false;
				vm.projectData = null;

				$location.path('/home');

			})
			.error(function(err){
				console.log(err);}
				)
	}})