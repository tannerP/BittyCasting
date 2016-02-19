
angular.module('userApp', [
	"ngSanitize",
	"com.2fdevs.videogular",
	"com.2fdevs.videogular.plugins.controls",
	"com.2fdevs.videogular.plugins.overlayplay",
	"com.2fdevs.videogular.plugins.poster",
	'ui.bootstrap',
	'mgcrea.ngStrap',
	'ngAnimate',
	'app.routes',
	'authService',
	'userService',
	'AMMService',
	'AMMCtrl',
	'mainCtrl',
	'projectCtrl',
	'userCtrl'
	])
 .config(function($asideProvider) {
  angular.extend($asideProvider.defaults, {
    animation: 'am-slide-right',
    placement: 'right'
  });
})
.config(function($httpProvider)	{	
	//attach our auth inteceptor to the http requests
	$httpProvider.interceptors.push('AuthInterceptor');
});