'use strict';

angular.module('ListInput',[])
  .directive('listInput', function() {
    return {
      templateUrl: 'components/reviewPage/reviewPage.html',
      restrict: 'E',
      scope:{
      	datasource: '= '
      }

      }
  });