import { bytesToSizeStr } from '../util/util';

export function bytesFilter() {
    return function(bytes) {
        var s = bytes ? bytes : 0;
        return bytesToSizeStr(s);
    };
}
