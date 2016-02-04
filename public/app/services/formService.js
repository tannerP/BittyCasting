
//gets data using $http
//Data gets passed into controller directory to get displayed
angular.module('formService', [])

.factory('Form',function($http){
	//create the object
	var userFactory = {};


	//create a user
	userFactory.create = function(formData)	{
		return $http.post('/register/', formData);
	};


	//return our entire userFactory object
	return userFactory;
	});


/*angular.module('formService',[])

	.factory('Form',function($http){
		var formFactory = {};

		formfactory.save = function(formData)	{
			return $http.post('api/newproject');
		};
		return formFactory;
	})*/