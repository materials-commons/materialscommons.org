function doConfig() {
    if (window.location.hostname === 'localhost') {
        mcglobals.apihost = window.location.protocol + '//localhost:5002';
    } else {
        mcglobals.apihost = window.location.protocol + '//' + window.location.hostname + '/api';
    }
}
