angular.module('Nav', [])
.directive('nav', function() {
  return {
  	restrict:'A',
    templateUrl:'components/nav/nav.tmpl.html'
  };
});