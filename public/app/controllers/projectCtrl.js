angular.module('projectCtrl',['userService', 'mgcrea.ngStrap']).
controller('rolePageController', function(Role, Project ,$location, $routeParams, $scope, $aside, $route){

}).
controller('prjDetailController', function(Role, Project ,$location, $routeParams, $scope, $aside, $route){
		var vm = this;
		vm.processing = true;
		vm.Roles  = [];
		vm.project = {};
		var gridView = true;
		vm.toggleView = function(){
			vm.gridView = !vm.gridView;
		}
		var newRoleAside = $aside({
											scope:$scope,
											show: false,
											keyboard:true, 
										 	controller:'addRoleController',
										 	controllerAs:'roleAside',						
										  templateUrl:'/app/views/pages/role_form.tmpl.html'		
										}),
				editPrjAside = $aside({
											scope:$scope,
											keyboard:true, 
											show: false,
											controller:'editProjectController',
										 	controllerAs:'projectAside',
										  templateUrl:'/app/views/pages/project_form.tmpl.html'		
										}),
		shareRoleAside = $aside({
											scope:$scope,
											show: false,
											keyboard:true,
											controller:'shareRoleController',
										 	controllerAs:'roleAside', 
										  templateUrl:'/app/views/pages/role_share.tmpl.html'		
										});
		deleteRoleAside = $aside({
											scope:$scope,
											keyboard:true, 
											show: false,
											controller:'deleteRoleController',
											controllerAs:'aside',
										  templateUrl:'/app/views/pages/role_delete.tmpl.html'		
										});
		vm.deleteBtn = function(data){
			vm.roleData = data;
			deleteRoleAside.$promise.then(deleteRoleAside.toggle);	
		}
		vm.shareBtn = function(data){
			vm.roleData = data;
			shareRoleAside.$promise.then(shareRoleAside.toggle);	
		}
		vm.createBtn = function(){
			vm.roleData = {};
			console.log('createRoleBtn');
			newRoleAside.$promise.then(newRoleAside.toggle);	
		}
		vm.editPrjBtn = function(){
			vm.roleData = {};
			editPrjAside.$promise.then(editPrjAside.toggle);	
		}
		vm.back = function(){
			window.history.back();		}

		//remove, get data from parent scope
		Project.get($routeParams.project_id)
			.success(function(data){
					vm.project = data.project;
					console.log(vm.project);
				})
			.error(function(err){
				vm.message = err;
			});
		
		Role.getAll($routeParams.project_id)
		.success(function(data){
			vm.processing = false;
			vm.Roles = data.data;
			var temp =  JSON.stringify(data.data);
			
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
 controller('shareRoleController', ['$scope', '$alert',
  function ($scope,$alert) {
        var url_base = "bittycasting.com/Apply"
        $scope.textToCopy = url_base;
        $scope.toggle = false;
      
         var successAlert = $alert({title: 'Copied!',animation:'am-fade-and-slide-top',duration:'10',
           placement: 'top-right', type: 'success', show: false, type:'success'}),
         errAlert = $alert({title: 'Link:',
          content: 'Copied',
           placement: 'top-right', type: 'info', show: false, type:'success'});           

        $scope.success = function () {
            $scope.toggle = true;
            successAlert.toggle();
        };

        $scope.fail = function (err) {
            console.error('Error!', err);
           errAlert.toggle();
        }
      }
    ]).
controller('deleteRoleController', function(Role, $location, $routeParams, $route, $scope){
		var vm = this;
		vm.roleData = {};
		vm.delete = function(id){
			Role.delete(id)
				.success(function(){
					vm.roleData = {};
					$route.reload();
					$scope.$hide()
				})
				.error(function(err){
					console.log(err.message);
				})
	}}).
	controller('editRoleController', function(Role, $location, $routeParams){
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

	controller('addRoleController', function(Role, $location, $routeParams, $route, $scope){
		var vm = this;
		vm.edit = false;
		vm.roleData = {};
		vm.createRoleBtn = function(){
			console.log("project ID :" + $routeParams.project_id);
			
			vm.projectID = $routeParams.project_id;
			console.log("Role Data:" + JSON.stringify(vm.roleData));			
			Role.create(vm.projectID, vm.roleData)
				.success(function(){
					vm.roleData = {};
					$route.reload();
					$scope.$hide()
				})
				.error(function(err){
					console.log(err.message);
				})
	}}).
//home.html
	controller('home_ProjectsController',
	 function(Project, $location, $aside,$scope)	{
		var vm = this;
				vm.getProject = function(prjID){
					$location.path('/projectDetails/'+prjID);
				}
		vm.gridView = true;
		vm.toggleView = function(){
				vm.gridView = !vm.gridView;
			}
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
			$location.path("/projectDetails/"+projectID);
			}
		}).
//project.html
	controller('newProjectController', function(Project, $location,$route, $scope)	{
		var vm = this;
		vm.NEW = true;
		vm.projectData;
		vm.save = function(){
			vm. processing = true;
			vm.message;
			Project.create(vm.projectData)
				.success(function(data)	{
					console.log(data);
					console.log(vm.projectData);
					$route.reload();
					vm.processing = false;
					vm.projectData = {};
					vm.message = data.message;
					$scope.$hide()
				});
			$location.path('/home');

		}}).

	//page: project.html
	controller('editProjectController', function(Project,$location,$routeParams)	{
		var vm = this;
		vm.NEW = false;
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