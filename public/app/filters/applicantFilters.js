angular.module('applicantFilters', [])

.filter('applicants', function() {
      return function(applicants, filter) {
        var filtered = [];
        console.log(filter)
        switch (filter) {
          case "Favorites":
            if (!applicants) return applicants;
            for (var a in applicants) {
              var applicant = applicants[a];
                /*console.log(applicant.name)
                console.log(applicant.favs)*/
                if (applicant.numFavs > 0) {

                  filtered.push(applicant);
                }
              /*}*/

            }
            break;
          default:
            {
              /*angular.copy(applicants,filtered)*/
              break;
            }
            /*return filtered;*/
        };
        
        if (filtered.length > 0) return filtered
        else return applicants;
      }});