'use strict';
angular.module('ProjectView',[])
/*notice ppublicview vs prpublicview and, their assiociated html-page differences*/
.directive('ppublicview', function() {
    return {
      /*templateUrl: 'components/project_view/project_view.html',*/
      /*templateUrl: 'components/review_page/reviewPage.html',*/
      restrict: 'E',
      scope:{
      	page: '=ctrl',
      },
      templateUrl: 'components/project_view/project_public_view.html'
    }
  })
.directive('prpublicview', function() {
    return {
      /*templateUrl: 'components/project_view/project_view.html',*/
      /*templateUrl: 'components/review_page/reviewPage.html',*/
      restrict: 'E',
      scope:{
        page: '=ctrl',
      },
      templateUrl: 'components/project_view/project_npublic_view.html'
    }
  });