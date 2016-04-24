
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
	'flow',
	'720kb.socialshare',
	'truncate',
	'app.routes',
	'textarea-fit'
	])
	/*.service('MetaService', function() {
       var title = 'Web App';
       var metaDescription = '';
       var metaKeywords = '';
       return {
          set: function(newTitle, newMetaDescription, newKeywords) {
              metaKeywords = newKeywords;
              metaDescription = newMetaDescription;
              title = newTitle; 
          },
          metaTitle: function(){ return title; },
          metaDescription: function() { return metaDescription; },
          metaKeywords: function() { return metaKeywords; }
       }
    })*/
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
	/*$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];*/


});