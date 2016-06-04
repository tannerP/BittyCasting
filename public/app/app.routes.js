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
            templateUrl: 'app/views/pages/application_role_level.html',
            controller: 'ApplicantRoleLvlController',
            controllerAs: 'page'
        })
        .when('/Apply/Project/:id',  {
            templateUrl: 'app/views/pages/application_project_level.html',
            controller: 'ApplicantProjectLvlController',
            controllerAs: 'page'
        })
        //project    
        .when('/project/:project_id',  {
            templateUrl: 'app/views/pages/project_page.html',
            controller: 'ProjectPageController',
            controllerAs: 'page'
        })
    /*---------------- Private ----------------*/
    //role
        .when('/role/:role_id',  {
            templateUrl: 'app/views/pages/role_page.html',
            controller: 'RolePageController',
            controllerAs: 'page'
        })
        .when('/addApplicant/:role_id',  {
            templateUrl: 'app/views/pages/addApplicants.html',
            controller: 'AddApplicantController',
            controllerAs: 'page'
        })
    //User
        .when('/profile',  {
                templateUrl: 'app/views/pages/profile.html',
                 controller: 'profileController',
                controllerAs: 'user'
            })
    /*---------------- User ----------------*/
        .when('/confirm/user/:confirmID',  {
            templateUrl: 'app/views/pages/signup_confirm.html',
            controller: 'signupConfirmCtrl',
            controllerAs: 'user'
        })
        .when('/register/invite/:inviteID',  {
            templateUrl: 'app/views/pages/signup.html',
            controller: 'signupInviteCtrl',
            controllerAs: 'user'
        })
    /*---------------- Admin ----------------*/
 /*       .when('/users',  {
            templateUrl: 'app/views/pages/users/all.html',
            controller: 'userController',
            controllerAs: 'user'
        })*/
        .when('/users/create',  {
            templateUrl: 'app/views/pages/signup.html',
            controller: 'signupCtrl',
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
