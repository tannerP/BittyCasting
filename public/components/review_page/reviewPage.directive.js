'use strict';

angular.module('ReviewPage',[])
  .directive('review', function() {
    return {
      templateUrl: 'components/review_page/reviewPage.html',
      restrict: 'A'
      }
  });  
/*  .controller('reviewPgCtrl', 
	function($location, $routeParams,
	 $scope,$route){
		var vm = this;
		vm.nextApp = function(){
			$scope.currIndex += 1;
		}
		console.log($scope.currIndex);
		$scope.currApp = $scope.applicants[$scope.currIndex];
		console.log($scope.currApp);

	});
*/