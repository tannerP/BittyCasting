angular.module('app.routes', ['ngRoute'])
.config(
    function($routeProvider, $locationProvider) {
    $routeProvider
     /*---------------- Public ----------------*/   
        .when('/', {
            templateUrl : '/app/views/pages/index.html'
        })
        .when('/home',  {
            templateUrl: 'app/views/pages/home.html',
            controller: 'HomePageController',
            controllerAs: 'home'
        })
        .when('/privacy_policy',  {
            templateUrl: 'app/views/pages/privacy_policy.html',
        })
        .when('/submission_agreement',  {
            templateUrl: 'app/views/pages/submission_agreement.html',
        })
        .when('/terms_of_service',  {
            templateUrl: 'app/views/pages/terms_of_service.html',
        })
        .when('/login', {
            templateUrl :'/app/views/pages/login.html',
        	controller   :'loginCtrl',
        	controllerAs   : 'login'
        })
        .when('/Thankyou', {
            templateUrl :'/app/views/pages/thankyou.html',
            controller   :'loginCtrl',
            controllerAs   : 'login'
        })
        .when('/Apply/:id',  {
            templateUrl: 'app/views/pages/Apply.html',
            controller: 'ApplyController',
            controllerAs: 'page'
        })
        //project    
        .when('/project/:project_id',  {
            templateUrl: 'app/views/pages/project_page.html',
            controller: 'ProjectPageController',
            controllerAs: 'page'
        })
        .when('/role/:role_id',  {
            templateUrl: 'app/views/pages/role_page.html',
            controller: 'RolePageController',
            controllerAs: 'page'
        })
    /*---------------- Private ----------------*/

    //User
        .when('/profile',  {
                templateUrl: 'app/views/pages/profile.html',
                 controller: 'profileController',
                controllerAs: 'user'
            })
        .otherwise({
        redirectTo: '/'
      });
    // get rid of the hash in the URL
    $locationProvider.html5Mode(true);
    }
);
