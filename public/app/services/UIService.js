angular.module('UIService', ['userService'])

.service("HomeService",function(User){
	var home = {};
		  home.view = "";

	home.setView = function(view){	
		home.view = view;
	}

	home.getView = function(callback){
		callback(home.view); return;
	}

	return home;
})

.service("RoleService",function($http, HomeService){
	var role = {};
		  role.view = "";

	role.setView = function(view){	
		console.log(view)
		role.view = view;
		return;
/*				return $http.put('/api/user/settings' , role);*/
	}
	role.getView = function(callback){
		return callback(role.view); ;
	}

	return role;
})