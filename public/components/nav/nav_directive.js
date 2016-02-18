angular.module('userApp', [])
	.directive('nav', function(){
		return{
			restrict:"E",
			template:"app/views/pages/nav.tmplt.html"
		}
	})
