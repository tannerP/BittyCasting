angular.module('app.routes', ['ngRoute'])
// configure our routes
.config(
    function($routeProvider, $locationProvider) {
    $routeProvider
        // route for the home page
        .when('/', {
            templateUrl : '/app/views/pages/home.html',
            controller : 'homeCtrl',
            controllerAs : 'home'
        })
        //login page
        .when('/login', {
            templateUrl : '/app/views/pages/login.html',
        	controller   : 'mainController',
        	controllerAs   : 'login'
        })
        .when('/profile',  {
            templateUrl: 'app/views/pages/profile.html',
            controller: 'loadProjectsController',
            controllerAs: 'projectsController'
        })
/*---------------- Projects ----------------*/

        .when('/newproject',  {
            templateUrl: 'app/views/pages/project.html',
            controller: 'newProjectController',
            controllerAs: 'project'
        })
        .when('/edit_projectDetails/:project_id',  {
            templateUrl: 'app/views/pages/project.html',
            controller: 'saveEdittingProjectController',
            controllerAs: 'project'
        })
        .when('/castings/:project_id',  {
            templateUrl: 'app/views/pages/castings.html',
            controller: 'projectcastingsController',
            controllerAs: 'project'
        })
/*---------------- Roles ----------------*/
        .when('/addRole/:project_id',  {
            templateUrl: 'app/views/pages/addRole.html',
            controller: 'roleFormController',
            controllerAs: 'page'
        })

/*---------------- Users ----------------*/
        //form to create a new user
        // same view as edit page
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
        //  page to edit a user
        .when('/users/:user_id', {
            templateUrl: 'app/views/pages/users/single.html',
            controller: 'userEditController',
            controllerAs: 'user'
        })

 /*---------------- Public ----------------*/  

        .when('/features', {
            templateUrl : '/app/views/pages/features.html',
            controller : 'homeCtrl',
            controllerAs : 'home'
        })
        .when('/pricing', {
            templateUrl : '/app/views/pages/pricing.html',
            controller : 'homeCtrl',
            controllerAs : 'home'
        })    
        .when('/resources', {
            templateUrl : '/app/views/pages/resources.html',
            controller : 'homeCtrl',
            controllerAs : 'home'
        })    
        .when('/signup', {
            templateUrl : '/app/views/pages/signup.html',
            controller   : 'userCreateController',
            controllerAs   : 'user'
        })
        .otherwise({
        redirectTo: '/'
      });


    // get rid of the hash in the URL
    $locationProvider.html5Mode(true);
    }
);
