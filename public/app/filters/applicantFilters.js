angular.module('applicantFilters', [])

.filter('applicants', function() {
      return function(applicants, filter) {
        var filtered = [];
        switch (filter) {
          case "Favorites":
            if (!applicants) return applicants;
            for (var a in applicants) {

              var applicant = applicants[a];
              if (!applicant.favs || applicant.favs.length === 0) return filtered;

              for (var f in applicant.favs) {
                var cur = applicant.favs[f]
                if (applicant.favorited) {
                  filtered.push(applicant);
                }
              }

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