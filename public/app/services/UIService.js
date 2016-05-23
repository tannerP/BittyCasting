angular.module('UIService', [])

.service("HomeService",function(){
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

.service("RoleService",function(){
	var role = {};
		  role.view = "";

	role.setView = function(view){	
		role.view = view;
	}

	role.getView = function(callback){
		callback(role.view); return;
	}

	return role;
})