angular.module('UIService', [])

.service("HomeService",function(){
	var home = {};
		  home.view = "";

	home.setView = function(view){	
		console.log(view);
		home.view = view;
	}

	home.getView = function(callback){
		callback(home.view); return;
	}

	return home;
})