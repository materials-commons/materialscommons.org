if (window.location.hostname != "materialscommons.org")
{
    if (typeof testconfig != 'undefined') {
        mcglobals.bypasslogin = testconfig.bypasslogin;
        mcglobals.username = testconfig.username;
        mcglobals.apihost = testconfig.apihost;
    }
}

