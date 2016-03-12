//gets data using $http
//Data gets passed into controller directory to get displayed
angular.module('userService', [])

.factory('Pub', function($http){
	var pubFactory = [];
	
	pubFactory.getAppRole = function(id)	{
		return $http.get('applicationRole/' + id);
	}
	pubFactory.getAppPrj = function(id)	{
		return $http.get('applicationPrj/' + id);
	}
	return pubFactory;
})

.factory('Applicant', function($http){
	var appFactory={};	
	
	appFactory.update = function(id,data)	{
		return $http.put('/app/'+id, data);	
		}	 
	appFactory.delete = function(appID)	{
		console.log(appID);
		return $http.delete('api/applicant/'+ appID);
	}	 
	appFactory.apply = function(data)	{
		console.log(data);
		return $http.post('/applicant', data);	
	}	 
	appFactory.getAll = function(roleID)	{
		return $http.get('/api/applicants/'+ roleID)
		}
	/*Commenting*/
	appFactory.pushComment = function(id,data)	{
		return $http.put('api/applicant/comments/'+id, data);	
		}
	appFactory.deleteComment = function(id,data)	{
		console.log(data);
		return $http.delete('api/applicant/comments/'+id, {data:data});	
		}
	return appFactory;
})

.factory('Role', function($http){
	var roleFactory={};
	
	roleFactory.getAll = function(projectID)	{
		return $http.get('/api/roles/'+ projectID);
	}	 
	roleFactory.create = function(projectID, roleData){
		return $http.post('/api/createRole/'+projectID,roleData);
	}
	roleFactory.update = function(id,roleData){
		return $http.put('/api/role/' + id, roleData);
	}
	roleFactory.get = function(role_id)	{
		return $http.get('api/role/' + role_id);
	}
	roleFactory.delete  = function(id)	{
		return $http.delete('/api/role/' + id);
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
		return $http.get('/api/project/' + proj_id);
	}
	projectFactory.appGetPrj  = function(proj_id)	{
		return $http.get('/appPrj/' + proj_id);
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
