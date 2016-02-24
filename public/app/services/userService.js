//gets data using $http
//Data gets passed into controller directory to get displayed
angular.module('userService', [])

.factory('Role', function($http){
	var roleFactory={};
	 
	roleFactory.create = function(id, roleData){
		return $http.post('api/role/', roleData);
	}
	roleFactory.update = function(role_id,roleData){
		return $http.put('/api/role/' + role_id, roleData);
	}
	roleFactory.getAll = function(projectID)	{
		return $http.get('api/roles', projectID);
	}
	roleFactory.get = function(role_id)	{
		return $http.get('api/role/' + role_id);
	}
	roleFactory.delete  = function(role_id)	{
		return $http.delete('api/role/' + role_id);
	}
	
	return roleFactory;
})

.factory('Project', function($http){
	var projectFactory={};

	projectFactory.create = function(projectData) {
		return $http.post('api/project',projectData);
	}
	projectFactory.getAll = function()	{
		return $http.get('api/project');
	}
	projectFactory.get  = function(proj_id)	{
		return $http.get('api/project/' + proj_id);
	}
	projectFactory.delete  = function(proj_id)	{
		return $http.delete('api/project/' + proj_id);
	}
	projectFactory.update = function(id,projectData){
		return $http.put('/api/project/' + id, projectData);
	};
	return projectFactory;
})

.factory('User',function($http){
	var userFactory = {};
	var user = {};

	userFactory.get = function(id)	{
		//a function to get all the stuff
		return $http.get('api/users/' + id );
	};

	userFactory.all = function()	{
		return $http.get('/api/users');
	};

	userFactory.create = function(userData)	{
		return $http.post('/register/', userData);
	};

	userFactory.update = function(id,userData)	{
		return $http.put('/api/users/' + id, userData);
	};

	userFactory.delete = function(id)	{
		return $http.delete('/api/users/' + id);
	};

	return userFactory;
	});
