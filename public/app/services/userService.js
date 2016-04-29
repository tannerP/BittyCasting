//gets data using $http
//Data gets passed into controller directory to get displayed
angular.module('userService', [])

.service("Meta",function(){
	var meta = new Object();

	this.default = function(){
		meta.site_name = "http://bittycasting.com";
		meta.type = "website";
		meta.title= "BittyCasting";
		meta.url = "http://bittycasting.com";
		meta.description ="A free online casting tool for managing and organizing your next film, theater, or performance project.";        
		meta.logo =  "http://bittycasting.com/assets/imgs/favicon/apple-icon-114x114.png";

		return meta;
	}
	this.roleMeta = function(role, project){
		meta.type = "website";
		meta.title= role.name
		meta.site_name = "http://bittycasting.com";
		meta.url += meta.site_name + "/Apply/" + role._id;
		meta.description = role.description;
		if(project.coverphoto.name === "default"){
			console.log("this is default photo");
			meta.image = meta.site_name + '/'+project.coverphoto.source;
			console.log(meta.image);}
		else{ meta.image = "http://" + project.coverphoto.source.replace(/.*?:\/\//g, "");}
		/*meta.image_secure = project.coverphoto.source;*/
		return meta;
	}


	/*return meta;*/
})

.factory('Prerender', function($http){
	var prerender = {};

	prerender.cacheIt = function(roleID){
		/*console.log(link);
		"?_escaped_fragment_"
		*/
		/*$http.get("https://bittycasting.com/Apply/+"+ "roleID" + )*/
		$http.get("/Apply/"+ roleID + "?_escaped_fragment_")
			.then(function(response){
				console.log(response);
			});
	}
	return prerender;
})

.factory('Mail', function($http){
	var mailFactory = {};
	
	mailFactory.betaUser = function(email)	{
		return $http.get('submit/:' + email);
	}
	mailFactory.sendFB = function(data)	{
		/*console.log(feedback);*/
		return $http.put('feedback' ,data);
	}
/*	pubFactory.getAppPrj = function(id)	{
		return $http.get('applicationPrj/' + id);
	}*/
	return mailFactory;
})

.factory('Pub', function($http){
	var pubFactory = {};
	
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
		console.log(id);
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
		data.state="PUT"
		return $http.put('api/applicant/comments/'+id, data);	
		}
	appFactory.deleteComment = function(id,data)	{
		var newData ={
			owner:data.owner,
			comment:data.comment,
			_id:data._id,
			state:"DELETE"
		}
		console.log(newData);
		return $http.put('api/applicant/comments/'+id, newData);	
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
	roleFactory.countApps  = function(id)	{
		return $http.get('/api/AppCount/' + id);
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
	projectFactory.get  = function(projID)	{
		console.log(projID);
		return $http.get('/public/project/' + projID);
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
