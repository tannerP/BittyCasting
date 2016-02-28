
angular.module('userApp', [
	'angular-clipboard',
	'ngFileUpload',
	'ngSanitize',
	'ui.bootstrap',
	'mgcrea.ngStrap',
	'ngAnimate',
	'app.routes',
	'authService',
	'userService',
	'AMMService',
	'applyCtrl',
	'mainCtrl',
	'projectCtrl',
	'userCtrl',
	'footer'
	])
	.run(function ($rootScope, $location, $http) {

    $http.get('/api/config').success(function(config) {
        $rootScope.config = config;
      });
  })
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