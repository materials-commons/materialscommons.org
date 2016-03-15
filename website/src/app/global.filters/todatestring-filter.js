export function toDateStringFilter() {
    return function(input) {
        if (input) {
            var t = input.epoch_time;
            var s = new Date(t * 1000).toDateString();
            return s;
        }
        return "";
    };
}
