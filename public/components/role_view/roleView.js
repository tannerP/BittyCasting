'use strict';
angular.module('RoleView', ['userService',
    'mgcrea.ngStrap'
  ])
  /*notice ppublicview vs prpublicview and,
   their assiociated html-page differences*/
  .directive('rolePublicview', function() {






  	return {
      restrict: 'E',
      scope: {
        toggle: '&',
        currole: '=',
        roles: '=',
        project: '=',
      },
      templateUrl: 'components/project_view/project_public_view.html',
      controller: publicController,
      controllerAs: 'ppv',
      bindToController: true,
      //required Angular V1.3 and above to associate scope to value "ppv"
    }
  })