angular.module('applicantFilters', [])

.filter('applicants', function() {
  return function(applicants, favorited) {
    var filtered = [];
    console.log(favorited)
    switch (favorited){
    case "favorited":
        if (!applicants) return;
        for (var a in applicants) {
          var applicant = applicants[a];

          for (var f in applicant.favs) {
            var cur = applicant.favs[f]
            console.log(cur.roleID)


            /*if()*/

            if (applicant.favorited) {
              console.log("pushing")
              filtered.push(applicant);
            }
          }

        }break;
        /*if (/a/i.test(item.email.substring(0, 1))) {
          filtered.push(item);
        }*/
      default: filtered = applicants;
      }

      return filtered;
  };
});