angular.module('projectCtrl',['userService', 'mgcrea.ngStrap']).
controller('prjDetailController', function(Role, Project ,$location, $routeParams, $scope, $aside){
		var vm = this;
		vm.processing = true;
		vm.Roles  = [];
		vm.projectID = $routeParams.project_id;
		vm.project = {};
		var newRoleAside = $aside({
											show: false,
											keyboard:true, 
										 	controller:'addRoleController',
										 	controllerAs:'roleAside',						
										  templateUrl:'/app/views/pages/role_form.tmpl.html'		
										});

		vm.createRoleBtn = function(){
			vm.roleData = {};
			console.log('createRoleBtn');
			newRoleAside.$promise.then(newRoleAside.toggle);	
		}
		//remove, get data from parent scope
		Project.get(vm.project_id)
			.success(function(data){
					console.log(data.project);
					vm.project = data.project;
				})
			.error(function(err){
				vm.message = err;
			});
		
		Role.getAll(vm.projectID)
		.success(function(data){
			vm.processing = false;
			vm.Roles = data.data;
			var temp =  JSON.stringify(data.data);
			console.log(data.data[0]);
			
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
	}}).
	controller('edit_RoleController', function(Role, $location, $routeParams){
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

	controller('addRoleController', function(Role, $location, $routeParams){
		var vm = this;
		vm.edit = false;
		vm.roleData = {};
		vm.project_id = $routeParams.project_id;
		vm.createRole = function(){
			console.log("project ID :" + vm.project_id);
			
			vm.roleData.projectID = $routeParams.project_id;
			console.log(role)
			
			Role.create(vm.roleData)
				.success(function(){
					window.history.back();
				})
				.error(function(err){
					console.log(err.message);
				})
	}}).
controller('card_ProjectController', function(Project, $location, $aside, $scope)	{
var vm = this		
	vm.deleteCtrl = true;

  deletePrjAside = $aside({
  										scope:$scope,
											keyboard:true,
											show: false, 
										 	controller:'deleteProjectController',
										 	controllerAs:'asideProject',
										  templateUrl:'/app/views/pages/project_form.html'		
										});
	vm.message = "card controller message";
	vm.deleteBtn = function(prjData){
		vm.targetedPrj = prjData;
			deletePrjAside.toggle();
			console.log("hey");
		}
}).

//home.html
	controller('home_ProjectsController', function(Project, $location, $aside,$scope)	{
		var vm = this;
		var newPrjAside = $aside({
											scope:$scope,
											show: false,
											keyboard:true, 
										 	controller:'newProjectController',
										 	controllerAs:'projectAside',						
										  templateUrl:'/app/views/pages/project_form.tmpl.html'		
										});
		  deletePrjAside = $aside({
  										scope:$scope,
											show: false, 
											keyboard:true,
										 	controller:'deleteProjectController',
										 	controllerAs:'projectAside',
										 	templateUrl:'/app/views/pages/deleteProject.tmpl.html'		
										  })
		vm.processing = true;
		vm.projects;
		
		vm.newPrjBtn = function(){
			vm.projectData = {};
			newPrjAside.$promise.then(newPrjAside.toggle);	
			/*console.log(vm.projectData);*/
		}
		vm.deleteBtn = function(data){
			vm.projectData = data;
			deletePrjAside.$promise.then(deletePrjAside.toggle);	
			/*deletePrjAside.toggle();*/
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
	}}).
//project.html
	controller('newProjectController', function(Project, $location,$route, $scope)	{
		var vm = this;
		vm.existing = false;
		vm.projectData;
		vm.save = function(){
			vm. processing = true;
			vm.message;
			Project.create(vm.projectData)
				.success(function(data)	{
					$route.reload();
					vm.processing = false;
					vm.projectData = {};
					vm.message = data.message;
					$scope.$hide()
				});
			$location.path('/home');

		}}).

	//page: project.html
	controller('edit_ProjectController', function(Project,$location,$routeParams)	{
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

	}}).
	//Change to style.flexDirection = 'column-reverse' 
	controller('deleteProjectController',function(Project,$location,$scope,$route)	{
		var vm = this; 
		vm.process = true;
		vm.existing = true;
		vm.rolls = [];
		
		vm.delete = function(projID) {
			console.log('Deleting prodID:' + projID);
			Project.delete(projID)
			.success(function(){
				$route.reload();
				vm.processing = false;
				vm.projectData = null;
				$scope.$hide();	

			})
			.error(function(err){
				console.log(err);}
				)
	}})