export function toDateStringFilter() {
    return function(input) {
        if (input) {
            var t = input.epoch_time;
            return new Date(t * 1000).toDateString();
        }
        return "";
    };
}

export function toDateFilter() {
    return function(input) {
        if (input) {
            var t = input.epoch_time;
            var d = new Date(t * 1000);
            return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
        }
    }
}
