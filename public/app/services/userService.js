//gets data using $http
//Data gets passed into controller directory to get displayed
angular.module('userService', [])

.factory("EmailValidator", function($http) {
	var email = new Object();
	email.validate = function(email, callback){
		var MAILGUN_BASE_URL= "https://api.mailgun.net/v3/address/validate";
	
		$http.get(MAILGUN_BASE_URL, {
			params: {
				address: email,
				api_key: "pubkey-27a5198e54d0d8aec3a8fabfa7257d17"
			}
		 }).success(function(data, status, headers, config) {
		 	return callback(data.is_valid);
		 }).error(function(data, status, headers, config){
		 	console.log(data)
		 })
	}
	return email
})

.factory("EmailConfirmation", function($http) {
	var email = new Object();
	email.confirm = function(confirmID){
	 	return $http.get("register/confirm/"+confirmID)
	}
	email.resend = function(confirmID){
	 	return $http.get("register/resend/"+confirmID)
	}
	return email
})

.service("Meta", function() {
	var meta = new Object();
	meta.type = "website";
	meta.site_name = "https://bittycasting.com";

	this.default = function() {
		meta.title = "BittyCasting";
		meta.url = "https://bittycasting.com";
		meta.description = "A free online casting tool for managing and organizing your next film, theater, or performance project.";
		meta.image = "http://bittycasting.com/assets/imgs/favicon/apple-icon-310x310.png";
		return meta;
	}
	this.roleMeta = function(role, project) {
		meta.title = "CASTING CALL: " + role.name
		meta.url = ""
		meta.url = meta.site_name + "/Apply/" + role._id;
		meta.description = role.description;
		if (project.coverphoto.name === "default") {
			meta.image = meta.site_name + '/' + project.coverphoto.source;
		} else {
			meta.image = "https://" + project.coverphoto.source.replace(/.*?:\/\//g, "");
		}
		/*meta.image_secure = project.coverphoto.source;*/
		return meta;
	}
	this.prjMeta = function(project) {
			meta.title = "CASTING CALL: " + project.name
			meta.url = ""
			meta.url = meta.site_name + "/Apply/Project/" + project._id;
			meta.description = project.description;

			if (project.coverphoto.name === "default") {
				meta.image = meta.site_name + '/' + project.coverphoto.source;
			} else {
				meta.image = "https://" + project.coverphoto.source.replace(/.*?:\/\//g, "");
			}
			return meta;
		}
		/*return meta;*/
})

.factory('Prerender', function($http) {
	var prerender = {};

	var prerenderRecache = function(urlRecache) {
		$http.post("https://api.prerender.io/recache", {
			"prerenderToken": "RDdmSteuNT1ZCbqQ2O0h",
			"url": urlRecache
		}).then(function(response) {});
	}

	prerender.cacheRole = function(roleID) {
		/*console.log(roleID);*/
		var url = "https://bittycasting.com/Apply/" + roleID;
		prerenderRecache(url);
	}
	prerender.cacheProject = function(projectID) {
		/*console.log(projectID);*/
		var url = "https://bittycasting.com/Apply/Project" + projectID;
		prerenderRecache(url);
	}

	return prerender;
})

.factory('Mail', function($http) {
	var mailFactory = {};

	mailFactory.betaUser = function(email) {
		return $http.put('submit/:' + email);
	}

	mailFactory.sendCollabInvite = function(project,guestEmail)	{
/*		console.log(guestEmail)*/
			var data = {};
			data.email = guestEmail
			data.projectName = project.name;
			data.projectID = project._id;
			return $http.put('/api/collab/invite/'+data.projectID ,data);
		/*console.log(feedback);*/
		/*return $http.put('/api/collab/invite' ,data);*/
	}
/*	pubFactory.getAppPrj = function(id)	{
		return $http.get('applicationPrj/' + id);
	}*/
	mailFactory.sendFB = function(data) {
			/*console.log(feedback);*/
			return $http.put('feedback', data);
		}
		/*	pubFactory.getAppPrj = function(id)	{
				return $http.get('applicationPrj/' + id);
			}*/
	return mailFactory;
})

.factory('Pub', function($http) {
	var pubFactory = {};

	pubFactory.getAppRole = function(id) {
		return $http.get('public/role/' + id);
	}
	pubFactory.getAppPrj = function(id) {
		return $http.get('public/project/' + id);
	}
	return pubFactory;
})

.factory('Applicant', function($http) {
	var appFactory = {};

	appFactory.update = function(id, data) {
		return $http.put('/suppliment/' + id, data);
	}

	appFactory.viewedUpdate = function(appID, roleID) {
		var money = {};
		money.status = "new"
		money.roleID = roleID;
		return $http.put('/api/app/' + appID, money);
	}
	appFactory.favUpdate = function(app, roleID) {
			/*console.log(roleID);*/
			var money = {};
			money.status = "fav"
			money.roleID = roleID;
			/*console.log(money);*/

			return $http.put('/api/app/' + app._id, money);
		}
		/*appFactory.delete = function(appID, roleID)	{
			return $http.delete('api/applicant/'+ appID, roleID);
		}	 */
	appFactory.delete = function(appID, roleID) {
		var data = {};
		data.status = "delete";
		data.roleID = roleID;
		/*		console.log(data);*/
		return $http.put('api/applicant/' + appID, data);
	}
	appFactory.apply = function(data) {
		return $http.post('/applicant', data);
	}
	appFactory.multiApply = function(data) {
		return $http.post('/applicant', data)
			.then(function(data) {
				return data;
			})
	}
	appFactory.getAll = function(roleID) {
		return $http.get('/api/applicants/' + roleID)
	}

	/*Commenting*/
	appFactory.pushComment = function(id, data) {
		data.state = "PUT"
		return $http.put('api/comments/' + id, data);
	}
	appFactory.deleteComment = function(id, data) {
		var newData = {
			owner: data.owner,
			comment: data.comment,
			_id: data._id,
			state: "DELETE"
		}
		return $http.put('api/comments/' + id, newData);
	}
	return appFactory;
})

.factory('Role', function($http) {
	var roleFactory = {};

	roleFactory.getAll = function(projectID) {
		return $http.get('/api/roles/' + projectID);
	}
	roleFactory.create = function(projectID, roleData) {
		return $http.post('/api/createRole/' + projectID, roleData);
	}
	roleFactory.update = function(id, roleData) {
		return $http.put('/api/role/' + id, roleData);
	}
	roleFactory.get = function(role_id) {
		return $http.get('public/role/' + role_id);
	}
	roleFactory.delete = function(id) {
		return $http.delete('/api/role/' + id);
	}
	roleFactory.countApps = function(id) {
		return $http.get('/api/AppCount/' + id);
	}

	return roleFactory;
})

.factory('Project', function($http) {
	var projectFactory = {};

	projectFactory.response2Invite = function(response,project){
		var money = {}
				money.response = response;
				money.projectID = project._id;
		return $http.put('api/collab/response', money);
	}

	projectFactory.removeCollab = function(projectID,collab){
		var money = {};
		money.projectID = projectID;
		money.userID = collab.userID;
		console.log(money)
		return $http.put('api/collab/remove', money);
	}
	projectFactory.create = function(projectData) {
		return $http.post('api/project', projectData);
	}
	projectFactory.getAll = function() {
		return $http.get('api/project');
	}
	projectFactory.get = function(projID) {
		return $http.get('/public/project/' + projID);
	}
	projectFactory.appGetPrj = function(proj_id) {
		return $http.get('/appPrj/' + proj_id);
	}
	projectFactory.delete = function(proj_id) {
		return $http.delete('api/project/' + proj_id);
	}
	projectFactory.update = function(id, projectData) {
		return $http.put('/api/project/' + id, projectData);
	};
	return projectFactory;
})

.factory('User', function($http) {
	var userFactory = {};
	var user = {};

	userFactory.get = function(id) {
		//a function to get all the stuff
		return $http.get('api/users/' + id);
	};

	userFactory.all = function() {
		return $http.get('/api/users');
	};

	userFactory.createWithInvitation = function(inviteID,userData)	{
		console.log(inviteID)
		return $http.put('/register/invitation/'+inviteID, userData);
	};
	userFactory.create = function(userData)	{

		return $http.post('/register/', userData);
	};

	userFactory.update = function(id, userData) {
		return $http.put('/api/users/' + id, userData);
	};

	userFactory.delete = function(id) {
		return $http.delete('/api/users/' + id);
	};

	/*userFactory.updateViewPref = function(viewType, page)	{
		return $http.delete('/api/users/' + id);
	};*/

	return userFactory;
});