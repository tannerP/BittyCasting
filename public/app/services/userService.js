//gets data using $http
//Data gets passed into controller directory to get displayed
angular.module('userService', [])

.factory('Role', function($http){
	var roleFactory={};
	 
	roleFactory.create = function(projectID, roleData){
		return $http.post('api/role/'+ projectID, roleData);
	}
	roleFactory.update = function(role_id,roleData){
		return $http.put('/api/project/' + role_id, roleData);
	}
	roleFactory.getAll = function(projectID)	{
		return $http.get('api/roles/' + projectID);
	}
	roleFactory.get  = function(role_id)	{
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
	//create the object
	var userFactory = {};
	var user = {};

	//get a single user
	userFactory.get = function(id)	{
		//a function to get all the stuff
		return $http.get('api/users/' + id );
	};
	//get all users
	userFactory.all = function()	{
		return $http.get('/api/users');
	};

	//create a user
	userFactory.create = function(userData)	{
		return $http.post('/register/', userData);
	};

	//update a user
	userFactory.update = function(id,userData)	{
		return $http.put('/api/users/' + id, userData);
	};

	//delete a user
	userFactory.delete = function(id)	{
		return $http.delete('/api/users/' + id);
	};

	//return our entire userFactory object
	return userFactory;
	});
