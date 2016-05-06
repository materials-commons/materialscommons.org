angular.module('materialscommons').factory('editorOpts', editorOptsService);

function editorOptsService() {
    return function(heightWidthOpts) {
        return {
            height: '' + heightWidthOpts.height + 'vh',
            width: '' + heightWidthOpts.width + 'vw',
            uiColor: '#f4f5f7',
            extraPlugins: 'forms,mathjax,codesnippet,smiley,liststyle,templates,find,sourcedialog',
            mathJaxLib: 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
            toolbar: 'custom',
            floatSpacePinnedOffsetY: 80,
            toolbar_custom: [
                {name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', 'Underline']},
                {name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote']},
                {name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
                {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
                {name: 'miscItems', items: ['Checkbox', 'Mathjax', 'CodeSnippet', 'Smiley', 'Templates']},
                {name: 'find', items: ['Find', 'Replace']},
                {name: 'tools', items: ['SpellChecker', 'Maximize']},
                '/',
                {
                    name: 'styles',
                    items: ['Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat']
                },
                {name: 'insert', items: ['Image', 'Table', 'SpecialChar']},
                {name: 'forms', items: ['Outdent', 'Indent']},
                {name: 'clipboard', items: ['Undo', 'Redo']},
                {name: 'document', items: ['PageBreak', 'Sourcedialog']}
            ]
        };
    };
}
