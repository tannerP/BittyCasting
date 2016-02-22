angular.module('HomeController',['userService', 'mgcrea.ngStrap'])

	.controller('home_ProjectsController', ['$aside','roject',
		function(Project, $location, $aside){
		var vm = this;
/*		var newPrjAside = $aside({
											title:"Login",
											show: false, 
										 	controller:'newProjectController',
										 	controllerAs:'project',						
										  templateUrl:'/app/views/pages/project_form.html'		
										});
				editPrjAside = $aside({
											title:"Edit",
											show: false, 
										 	controller:'edit_ProjectController',
										 	controllerAs:'project',						
										  templateUrl:'/app/views/pages/project_form.html'		
										});*/

		vm.processing = true;
		vm.projects;
		
		vm.createProject = function(){
			newPrjAside.toggle();
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
	}}])


	//project.html
	.controller('newProjectController', function(Project, $location, $window)	{
		var vm = this;
		vm.existing = false;
		vm.projectData;
		vm.save = function(){
			vm. processing = true;
			vm.message;
			Project.create(vm.projectData)
				.success(function(data)	{
					vm.processing = false;
					vm.projectData = {};
					vm.message = data.message;
				});
			$window.location.href('/home');

		}})
	.controller('edit_ProjectController', function(Project, $location, $routeParams){

	})
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
	