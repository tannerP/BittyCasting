angular.module('applicantFilters', [])

.filter('applicants', function() {
  return function(applicants, favorited) {
    var filtered = [];
    switch (favorited){
    case "Favorites":
      if (!applicants) return;
      for (var a in applicants) {
        
        var applicant = applicants[a];
        if(!applicant.favs || applicant.favs.length === 0 ) return filtered;
        
        for (var f in applicant.favs) {
          var cur = applicant.favs[f]
          if (applicant.favorited) {
            filtered.push(applicant);
          }
        }

      }
    break;
    default: filtered = applicants;
    }
  return filtered;
  };
});