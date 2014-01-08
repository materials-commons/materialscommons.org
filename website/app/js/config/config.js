function doConfig() {
    if (window.location.hostname === "test.materialscommons.org") {
        /*
         * test.materialscommons.org doesn't conform to the naming convention so
         * explicitly check for it and set the api path appropriately.
         */
         mcglobals.apihost = "https://apitest.materialscommons.org";
    } else {
        //console.log('in else part '+ window.location.hostname)
        //mcglobals.apihost = 'http://localhost:5000';
        //mcglobals.apikey = 'a74c165e52ba11e3bccaac162d80f1bf';

        mcglobals.apihost = window.location.protocol + "//api." + window.location.hostname;

    }
}


