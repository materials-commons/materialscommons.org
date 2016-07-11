export function bytesFilter() {
    function bytesToSizeStr(bytes) {
        if (bytes === 0) return '0 Byte';
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];

    }
    return function(bytes) {
        var s = bytes ? bytes : 0;
        return bytesToSizeStr(s);
    };
}


