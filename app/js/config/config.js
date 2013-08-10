if (window.location.hostname != "materialscommons.org")
{
    document.write('<script type="text/javascript" src="' + "app/js/config/testconfig.js" + '"></script>');
    if (typeof testconfig != 'undefined') {
        mcglobals.bypasslogin = testconfig.bypasslogin;
        mcglobals.username = testconfig.username;
        mcglobals.apihost = testconfig.apihost
    }
}

