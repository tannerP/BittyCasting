
angular.module('userApp', [
	'ngAnimate',
	'mgcrea.ngStrap',
	'app.routes',
	'authService',
	'userService',
	'AMMService',
	'AMMCtrl',
	'mainCtrl',
	'projectCtrl',
	'userCtrl',
	'ui.bootstrap'
	])
.config(function($httpProvider)	{	
	//attach our auth inteceptor to the http requests
	$httpProvider.interceptors.push('AuthInterceptor');
});