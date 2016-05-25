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
		meta.image =  "http://bittycasting.com/assets/imgs/favicon/apple-icon-310x310.png";
		return meta;
	}
	this.roleMeta = function(role, project){
		meta.type = "website";
		meta.title= "CASTING CALL: "+ role.name
		meta.site_name = "http://bittycasting.com";
		meta.url += meta.site_name + "/Apply/" + role._id;
		meta.description = role.description;
		if(project.coverphoto.name === "default"){
			meta.image = meta.site_name + '/'+project.coverphoto.source;
		}
		else{ meta.image = "http://" + project.coverphoto.source.replace(/.*?:\/\//g, "");}
		/*meta.image_secure = project.coverphoto.source;*/
		return meta;
	}
	this.prjMeta = function(project){
		meta.type = "website";
		meta.title= "CASTING CALL: "+ project.name
		meta.site_name = "http://bittycasting.com";
		meta.url = meta.site_name + "/project/" + project._id;
		meta.description = project.description;

		if(project.coverphoto.name === "default"){
			meta.image = meta.site_name + '/'+project.coverphoto.source;
		}
		else{ meta.image = "http://" + project.coverphoto.source.replace(/.*?:\/\//g, "");}
		return meta;
	}
	/*return meta;*/
})

.factory('Prerender', function($http){
	var prerender = {};

	var prerenderRecache = function(urlRecache){
		$http.post("https://api.prerender.io/recache",
		{
			"prerenderToken": "RDdmSteuNT1ZCbqQ2O0h",
			"url": urlRecache
		}).then(function(response){
			});
	}

	prerender.cacheRole = function(roleID){
		/*console.log(roleID);*/
		var url = "https://bittycasting.com/Apply/" + roleID;
		prerenderRecache(url);
	}
	prerender.cacheProject = function(projectID){
		/*console.log(projectID);*/
		var url = "https://bittycasting.com/Apply/Project" + projectID;
		prerenderRecache(url);
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
		return $http.get('public/role/' + id);
	}
	pubFactory.getAppPrj = function(id)	{
		return $http.get('public/project/' + id);
	}
	return pubFactory;
})

.factory('Applicant', function($http){
	var appFactory={};	
	
	appFactory.update = function(id,data)	{
		return $http.put('/suppliment/'+id, data);	
		}	 
	appFactory.viewedUpdate = function(appID, roleID)	{
		var money = {};
		money.status = "new"
		money.roleID = roleID;
		console.log(appID)
		console.log(roleID)
		return $http.put('/api/app/'+appID, money);	
		}	 
	appFactory.favUpdate = function(app,roleID)	{
		/*console.log(roleID);*/
		var money = {};
		money.status = "fav"
		money.roleID = roleID;
		/*console.log(money);*/

		return $http.put('/api/app/'+app._id, money);	
		}	 
	/*appFactory.delete = function(appID, roleID)	{
		return $http.delete('api/applicant/'+ appID, roleID);
	}	 */
	appFactory.delete = function(appID, roleID)	{
		var data = {};
		data.status = "delete";
		data.roleID = roleID;
/*		console.log(data);*/
		return $http.put('api/applicant/'+appID, data);
	}	 
	appFactory.apply = function(data)	{
		return $http.post('/applicant', data);	
	}
	appFactory.multiApply = function(data)	{
		return $http.post('/applicant', data)
		.then(function(data){
			return data;
		})
	}	 	 
	appFactory.getAll = function(roleID)	{
		return $http.get('/api/applicants/'+ roleID)
		}

	/*Commenting*/
	appFactory.pushComment = function(id,data)	{
		data.state="PUT"
		return $http.put('api/comments/'+id, data);	
		}
	appFactory.deleteComment = function(id,data)	{
		var newData ={
			owner:data.owner,
			comment:data.comment,
			_id:data._id,
			state:"DELETE"
		}
		return $http.put('api/comments/'+id, newData);	
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
		return $http.get('public/role/' + role_id);
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

	/*userFactory.updateViewPref = function(viewType, page)	{
		return $http.delete('/api/users/' + id);
	};*/

	return userFactory;
	});
