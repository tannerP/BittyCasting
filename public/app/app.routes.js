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
        .when('/signup', {
            templateUrl : '/app/views/pages/signup.html',
            controller   : 'signupCtrl',
            controllerAs   : 'user'
        })
        .when('/privacy_policy',  {
            templateUrl: 'app/views/pages/privacy_policy.html',
        })
        .when('/audition_agreement',  {
            templateUrl: 'app/views/pages/audition_agreement.html',
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
    /*---------------- Private ----------------*/
    //project    
        .when('/project/:project_id',  {
            templateUrl: 'app/views/pages/project_page.html',
            controller: 'ProjectPageController',
            controllerAs: 'projectCtr'
        })
    //role    
        .when('/applicants/:role_id',  {
            templateUrl: 'app/views/pages/applicants.html',
            controller: 'ApplicantPageController',
            controllerAs: 'page'
        })
    //User
    .when('/profile',  {
            templateUrl: 'app/views/pages/profile.html',
             controller: 'profileController',
            controllerAs: 'user'
        })
    /*---------------- Admin ----------------*/
        .when('/users',  {
            templateUrl: 'app/views/pages/users/all.html',
            controller: 'userController',
            controllerAs: 'user'
        })
        .when('/users/create',  {
            templateUrl: 'app/views/pages/signup.html',
            controller: 'userCreateController',
            controllerAs: 'user'
        })
        .when('/users/:user_id', {
            templateUrl: 'app/views/pages/users/single.html',
            controller: 'userEditController',
            controllerAs: 'user'
        })  
        .otherwise({
        redirectTo: '/'
      });
    // get rid of the hash in the URL
    $locationProvider.html5Mode(true);
    }
);
