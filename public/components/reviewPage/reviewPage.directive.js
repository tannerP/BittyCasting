'use strict';

angular.module('ReviewPage',[])
  .directive('review', function() {
    return {
      templateUrl: 'components/reviewPage/reviewPage.html',
      restrict: 'A'
    };
  });
