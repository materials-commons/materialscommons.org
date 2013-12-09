function doConfig() {
    if (window.location.hostname === "test.materialscommons.org") {
        /*
         * test.materialscommons.org doesn't conform to the naming convention so
         * explicitly check for it and set the api path appropriately.
         */
        mcglobals.apihost = "https://apitest.materialscommons.org";
    } else {
        mcglobals.apihost = window.location.protocol + "//api." + window.location.hostname;
    }
}

