export function toDateStringFilter() {
  return function(input) {
    if (input) {
      var t = input;
      var type = typeof t;
      if (type === 'string') {
        return new Date(t).toDateString();
      }
      if (type === 'Date') {
        return t.toDateString();
      }
      var date = null;
      try {
        date = new Date(t * 1000);
      } catch (ignore) {}
      if (date) {
        return date.toDateString();
      }
      return "";
    }
    return "";
  };
}
