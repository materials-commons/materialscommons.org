app.directive('plusMinusToggle', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
            elem.on('click', function() {
                var idtoslide = '#'+attr.plusMinusToggle;
                $(idtoslide).slideToggle('slow');
                $(this).find('i').toggleClass('fa fa-plus-square').toggleClass('fa fa-minus-square');
            });
        }
    };
});