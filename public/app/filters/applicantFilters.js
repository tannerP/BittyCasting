angular.module('applicantFilter',[])

.filter('startsWithA', function () {
  return function (items) {
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      /*console.log(item)*/
      filtered.push(item);
      /*if (/a/i.test(item.email.substring(0, 1))) {
        filtered.push(item);
      }*/
    }
    return filtered;
  };
});