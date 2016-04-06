
angular.module('userApp', [
	'angular-carousel',
	'ui.bootstrap',
	'xml',
	'angular-clipboard',
	'ngFileUpload',
	'ngSanitize',
	'ui.bootstrap',
	'mgcrea.ngStrap',
	'ngAnimate',
	'app.routes',
	'authService',
	'userService',
	'awsService',
	'applyCtrl',
	'mainCtrl',
	'projectCtrl',
	'userCtrl',
	'applicantsCtrl',
	'footer',
	'ReviewPage',
	'Nav',
	'pdf',
	"vimeoEmbed"
	])
  .run(function ($rootScope, $location, $http) {
    $http.get('/config').success(function(data) {
        $rootScope.awsConfig = data.awsConfig;
      });
  })
  .run(function($animate) {
  $animate.enabled(true);
	})
  .config(function($datepickerProvider) {
  angular.extend($datepickerProvider.defaults, {
    dateFormat: 'MM/dd/yyyy',
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