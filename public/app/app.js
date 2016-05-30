
angular.module('userApp', [
	'angular-carousel',
	'angular.filter',
	'ui.bootstrap',
	'xml',
	'angular-clipboard',
	'ngFileUpload',
	'ngSanitize',
	'ui.bootstrap',
	'mgcrea.ngStrap',
	'ngAnimate',
	'authService',
	'userService',
	'UIService',
	'awsService',
	'applyCtrl',
	'addApplicant',
	'mainCtrl',
	'projectCtrl',
	'userCtrl',
	'roleCtrl',
	'footer',
	'ReviewPage',
	'ProjectView',
	'ApplicantForm',
	'Nav',
	'pdf',
	'flow',
	'720kb.socialshare',
	'truncate',
	'app.routes',
	'textarea-fit'
	])
  .run(function($animate) {
  	$animate.enabled(true);
	})
  .config(function($datepickerProvider) {
	  angular.extend($datepickerProvider.defaults, {
	    dateFormat: 'MM/dd/yyyy',
	    startWeek: 4
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