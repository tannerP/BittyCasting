angular.module('app.routes', ['ngRoute'])
// configure our routes
.config(
    function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl : '/app/views/pages/index.html'
        })
        .when('/login', {
            templateUrl : '/app/views/pages/login.html',
        	controller   : 'loginCtrl',
        	controllerAs   : 'login'
        })
        .when('/home',  {
            templateUrl: 'app/views/pages/home.html',
            controller: 'home_ProjectsController',
            controllerAs: 'home'
        })
        .when('/profile',  {
            templateUrl: 'app/views/pages/profile.html',
            controller: 'profileCtrl',
            controllerAs: 'user'
        })
/*--------------- Applicants ---------------*/
        .when('/Apply/:role_id',  {
            templateUrl: 'app/views/pages/Apply.html',
            controller: 'applyController',
            controllerAs: 'page'
        })
/*---------------- Projects ----------------*/
        .when('/newproject',  {
            templateUrl: 'app/views/pages/project_form.html',
            controller: 'new_ProjectController',
            controllerAs: 'project'
        })
        .when('/edit_projectDetails/:project_id',  {
            templateUrl: 'app/views/pages/project_form.html',
            controller: 'edit_ProjectController',
            controllerAs: 'project'
        })
        .when('/project/:project_id',  {
            templateUrl: 'app/views/pages/ProjectDetails.html',
            /*controller: 'prjDetailController',
            controllerAs: 'prjDetailCtr'*/
        })
        /*---------------- Role ----------------*/
        .when('/addRole/:project_id',  {
            templateUrl: 'app/views/pages/role.html',
            controller: 'add_RoleController',
            controllerAs: 'page'
        })
        .when('/editRole/:role_id',  {
            templateUrl: 'app/views/pages/role.html',
            controller: 'edit_RoleController',
            controllerAs: 'page'

        })
        .when('/applicants/:role_id',  {
            templateUrl: 'app/views/pages/applicants.html',
            controller: 'rolePageController',
            controllerAs: 'page'
        })
/*---------------- Users ----------------*/
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
        .when('/signup', {
            templateUrl : '/app/views/pages/signup.html',
            controller   : 'signupCtrl',
            controllerAs   : 'user'
        })
        .otherwise({
        redirectTo: '/'
      });
    // get rid of the hash in the URL
    $locationProvider.html5Mode(true);
    }
);
