export function toDateStringFilter() {
  return function(input) {
    if (input) {
      var t = input;
      if (angular.isString(t)) {
        return new Date(t).toDateString();
      }
      if (angular.isNumber(t)) {
        new Date(t * 1000).toDateString();
      }
      if (angular.isObject(t) && (t instanceof Date)) {
        return t.toDateString();
      }
      return "";
    }
    return "";
  };
}
