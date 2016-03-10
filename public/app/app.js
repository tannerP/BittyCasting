
angular.module('userApp', [
	'angular-carousel',
	'ui.bootstrap',
	'xml',
	'angular-clipboard',
	'ngFileUpload',
	'ngSanitize',
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
	'applyCtrl',
	'mainCtrl',
	'projectCtrl',
	'userCtrl',
	'footer',
	'ReviewPage',
	'Nav'

	])
	.run(function ($rootScope, $location, $http) {
    $http.get('/config').success(function(data) {
        $rootScope.awsConfig = data.awsConfig;
      });
  })
  .config(function($datepickerProvider) {
  angular.extend($datepickerProvider.defaults, {
    dateFormat: 'dd/MM/yyyy',
    startWeek: 1
  	})
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