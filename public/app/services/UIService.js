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

.service("RoleService",function($http){
	var role = {};
		  role.view = "";

	role.setView = function(view){	
		role.view = view;
		role.page = 'role';
		return;
/*				return $http.put('/api/user/settings' , role);*/

	}


	role.getView = function(callback){
		var role = {};
		role.view = "";
		if(!role.view){
				$http.get('/api/user/settings', role).then(function(data){
					console.log(data)
				})}
		callback(role.view); ;
	}

	return role;
})