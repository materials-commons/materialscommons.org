angular.module('materialscommons').directive("mcFlowButton", mcFlowButtonDirective);

function mcFlowButtonDirective(mcFlow, mcprojstore, mcapi, User, $log) {
    'ngInject';

    return {
        restrict: 'E',
        replace: true,
        scope: {
            dir: "=dir"
        },
        template: "<span style='cursor: pointer' title='Upload to directory' class='mc-file-tree-control mc-flow-button text-uppercase'><i class='fa fa-fw fa-upload'></i>upload files</span>",
        link: function(scope, element, attrs) {
            const flow = mcFlow.get();
            const isDirectory = attrs.hasOwnProperty('flowDirectory');
            const isSingleFile = attrs.hasOwnProperty('flowSingleFile');
            const inputAttrs = attrs.hasOwnProperty('flowAttrs') && scope.$eval(attrs.flowAttrs);

            function each(obj, callback, context) {
                if (!obj) {
                    return;
                }
                let key;
                // Is Array?
                if (typeof(obj.length) !== 'undefined') {
                    for (key = 0; key < obj.length; key++) {
                        if (callback.call(context, obj[key], key) === false) {
                            return;
                        }
                    }
                } else {
                    for (key in obj) {
                        if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) {
                            return;
                        }
                    }
                }
            }

            function extend(dst) {
                each(arguments, function(obj) {
                    if (obj !== dst) {
                        each(obj, function(value, key) {
                            dst[key] = value;
                        });
                    }
                });
                return dst;
            }

            const assignBrowse = function(domNodes, isDirectory, isSingleFile, attributes) {
                if (typeof domNodes.length === 'undefined') {
                    domNodes = [domNodes];
                }

                each(domNodes, function(domNode) {
                    let input;
                    if (domNode.tagName === 'INPUT' && domNode.type === 'file') {
                        input = domNode;
                    } else {
                        input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        // display:none - not working in opera 12
                        extend(input.style, {
                            visibility: 'hidden',
                            position: 'absolute'
                        });
                        // for opera 12 browser, input must be assigned to a document
                        domNode.appendChild(input);
                        // https://developer.mozilla.org/en/using_files_from_web_applications)
                        // event listener is executed two times
                        // first one - original mouse click event
                        // second - input.click(), input is inside domNode
                        domNode.addEventListener('click', function() {
                            input.click();
                        }, false);
                    }
                    if (!flow.opts.singleFile && !isSingleFile) {
                        input.setAttribute('multiple', 'multiple');
                    }
                    if (isDirectory) {
                        input.setAttribute('webkitdirectory', 'webkitdirectory');
                    }
                    each(attributes, function(value, key) {
                        input.setAttribute(key, value);
                    });

                    // When new files are added, simply append them to the overall list
                    input.addEventListener('change', function(e) {
                        const proj = mcprojstore.currentProject;
                        each(e.target.files, function(f) {
                            const req = {
                                project_id: proj.id,
                                directory_id: scope.dir.data.id,
                                filename: f.name,
                                filesize: f.size,
                                chunk_size: flow.opts.chunkSize,
                                filemtime: f.lastModifiedDate.toUTCString(),
                                user_id: User.u()
                            };
                            const matchFn = function(file) {
                                return !!(file.name === req.filename &&
                                file.attrs.directory_id === req.directory_id &&
                                file.attrs.project_id === req.project_id);
                            };
                            if (!flow.findFile(matchFn)) {
                                mcapi("/upload")
                                    .success(function(resp) {
                                        const o = {
                                            id: resp.request_id,
                                            file: f,
                                            attrs: {
                                                directory_name: scope.dir.data.name,
                                                directory_id: scope.dir.data.id,
                                                project_id: proj.id,
                                                project_name: proj.name
                                            }
                                        };
                                        flow.addFiles([o], e);
                                    })
                                    .error(function(data, status) {
                                        $log.log("/upload failed %O", data, status);
                                    }).post(req);
                            }
                        });
                        e.target.value = '';
                    }, false);
                }, this);
            };

            assignBrowse(element, isDirectory, isSingleFile, inputAttrs);
        }
    };
}