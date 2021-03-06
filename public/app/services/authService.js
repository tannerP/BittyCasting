angular.module('authService', [])

//=============================================================================
// auth factory to login and get information 
// inject $http for communicating with the API
// inject $q to return promise objects
// inject AuthToken to manage tokens
//=============================================================================
.factory('Auth', function($http, $q, $window, AuthToken, $location) {

	//	create auth factory object
	var authFactory = {};
	//log a user in 

	authFactory.setToken = function(data, callback) {
		/*console.log(data)*/
		// return the promise object and its data
		AuthToken.setToken(data);
		return callback();		
	};

	authFactory.confirmEmail = function(confirmID) {

		// return the promise object and its data
		return $http.get("/register/confirm/" + confirmID)
			.success(function(data) {
				if (data.success) {
					AuthToken.setToken(data);
				}
				return data;
			});
	};

	authFactory.login = function(email, password) {
		// return the promise object and its data
		return $http.post('/login', {
				email: email,
				password: password
			})
			.success(function(data) {
				AuthToken.setToken(data);
				return data;
			});
	};

	// log a user out by clearing the token
	authFactory.logout = function() {
		//clear the token
		AuthToken.setToken();
	};

	//check if a user is logged in
	//checks if there is a local token
	authFactory.isLoggedIn = function() {
		if (AuthToken.getToken() != null)
			return true;
		else
			return false;
	};

	authFactory.getUser = function() {
		var _user = null;
		if (_user) return _user;
		else {
			return $http.get('/api/me').then(function(data) {
				_user = data.data;
				/*console.log(data)*/
				if (!_user) {
					authFactory.logout();
				}
				return _user;
			}, function err(response) {
				return response;
			})
		};
	}

	return authFactory;
})

//=============================================================================
//	factory for handling tokens
//	inject $window to store token client-side
//=============================================================================
.factory('AuthToken', function($window) {

	var authTokenFactory = {};

	//get the token out of local storage
	authTokenFactory.getToken = function() {
		var token = $window.localStorage.getItem('token');
		if (token != 'undefined') return token;
		else return null;
	};

	// function to get token or clear token
	// if a token is passed, set the token
	// if there is no token, clear it from local storage
	authTokenFactory.setToken = function(data) {
		if (data) {
			$window.localStorage.setItem('token', data.token);
		} else {
			$window.localStorage.removeItem('token');
		}
	};

	return authTokenFactory;
})

//=============================================================================
// application configuration to integrate token into requests
//=============================================================================
.factory('AuthInterceptor', function($q, $location, AuthToken) {

	var interceptorFactory = {};

	//	 this will hapen on all HTTP requests
	interceptorFactory.request = function(config) {

		//	grab the token
		var token = AuthToken.getToken();

		//if the token exists, add it to the header as x-access-token
		if (token)
			config.headers['x-access-token'] = token;

		return config;
	};

	//	happens on response errors
	interceptorFactory.responseError = function(response) {
		//	if our server returns a 403 forbidden response
		if (response.status == 403)
		/*$location.path('/login');*/
		//return the errors from the server as a promise
			return $q.reject(response);
	};

	return interceptorFactory;
});