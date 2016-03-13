'use strict';

angular.module('footer',[])
  .directive('footer', function() {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'A',
      link: function(scope, element) {
        element.addClass('footer');
      }
    };
  });
