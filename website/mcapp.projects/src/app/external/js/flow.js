/**
 * @license MIT
 */
(function(window, document, undefined) {
    'use strict';

    /**
     * Flow.js is a library providing multiple simultaneous, stable and
     * resumable uploads via the HTML5 File API.
     * @param [opts]
     * @param {number} [opts.chunkSize]
     * @param {bool} [opts.forceChunkSize]
     * @param {number} [opts.simultaneousUploads]
     * @param {bool} [opts.singleFile]
     * @param {string} [opts.fileParameterName]
     * @param {number} [opts.progressCallbacksInterval]
     * @param {number} [opts.speedSmoothingFactor]
     * @param {Object|Function} [opts.query]
     * @param {Object|Function} [opts.headers]
     * @param {bool} [opts.withCredentials]
     * @param {Function} [opts.preprocess]
     * @param {string} [opts.method]
     * @param {string|Function} [opts.testMethod]
     * @param {string|Function} [opts.uploadMethod]
     * @param {bool} [opts.prioritizeFirstAndLastChunk]
     * @param {string|Function} [opts.target]
     * @param {number} [opts.maxChunkRetries]
     * @param {number} [opts.chunkRetryInterval]
     * @param {Array.<number>} [opts.permanentErrors]
     * @param {Array.<number>} [opts.successStatuses]
     * @param {Function} [opts.generateUniqueIdentifier]
     * @constructor
     */
    function Flow(opts) {
        /**
         * Supported by browser?
         * @type {boolean}
         */
        this.support = (
            typeof File !== 'undefined' &&
                typeof Blob !== 'undefined' &&
                typeof FileList !== 'undefined' &&
                (
                    !!Blob.prototype.slice || !!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice ||
                        false
                ) // slicing files support
        );

        if (!this.support) {
            return ;
        }

        /**
         * Check if directory upload is supported
         * @type {boolean}
         */
        this.supportDirectory = /WebKit/.test(window.navigator.userAgent);

        /**
         * List of FlowFile objects
         * @type {Array.<FlowFile>}
         */
        this.files = [];

        /**
         * Default options for flow.js
         * @type {Object}
         */
        this.defaults = {
            chunkSize: 1024 * 1024,
            forceChunkSize: false,
            simultaneousUploads: 3,
            singleFile: false,
            fileParameterName: 'file',
            progressCallbacksInterval: 500,
            speedSmoothingFactor: 0.1,
            query: {},
            headers: {},
            withCredentials: false,
            preprocess: null,
            method: 'multipart',
            testMethod: 'GET',
            uploadMethod: 'POST',
            prioritizeFirstAndLastChunk: false,
            target: '/',
            testChunks: true,
            generateUniqueIdentifier: null,
            maxChunkRetries: 0,
            chunkRetryInterval: null,
            permanentErrors: [404, 415, 500, 501],
            successStatuses: [200, 201, 202],
            onDropStopPropagation: false
        };

        /**
         * Current options
         * @type {Object}
         */
        this.opts = {};

        /**
         * List of events:
         *  key stands for event name
         *  value array list of callbacks
         * @type {}
         */
        this.events = {};

        var $ = this;

        /**
         * On drop event
         * @function
         * @param {MouseEvent} event
         */
        this.onDrop = function (event) {
            if ($.opts.onDropStopPropagation) {
                event.stopPropagation();
            }
            event.preventDefault();
            var dataTransfer = event.dataTransfer;
            if (dataTransfer.items && dataTransfer.items[0] &&
                dataTransfer.items[0].webkitGetAsEntry) {
                $.webkitReadDataTransfer(event);
            } else {
                $.addFiles(dataTransfer.files, event);
            }
        };

        /**
         * Prevent default
         * @function
         * @param {MouseEvent} event
         */
        this.preventEvent = function (event) {
            event.preventDefault();
        };


        /**
         * Current options
         * @type {Object}
         */
        this.opts = Flow.extend({}, this.defaults, opts || {});
    }

    Flow.prototype = {
        /**
         * Set a callback for an event, possible events:
         * fileSuccess(file), fileProgress(file), fileAdded(file, event),
         * fileRetry(file), fileError(file, message), complete(),
         * progress(), error(message, file), pause()
         * @function
         * @param {string} event
         * @param {Function} callback
         */
        on: function (event, callback) {
            event = event.toLowerCase();
            if (!this.events.hasOwnProperty(event)) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
        },

        /**
         * Remove event callback
         * @function
         * @param {string} [event] removes all events if not specified
         * @param {Function} [fn] removes all callbacks of event if not specified
         */
        off: function (event, fn) {
            if (event !== undefined) {
                event = event.toLowerCase();
                if (fn !== undefined) {
                    if (this.events.hasOwnProperty(event)) {
                        arrayRemove(this.events[event], fn);
                    }
                } else {
                    delete this.events[event];
                }
            } else {
                this.events = {};
            }
        },

        /**
         * Fire an event
         * @function
         * @param {string} event event name
         * @param {...} args arguments of a callback
         * @return {bool} value is false if at least one of the event handlers which handled this event
         * returned false. Otherwise it returns true.
         */
        fire: function (event, args) {
            // `arguments` is an object, not array, in FF, so:
            args = Array.prototype.slice.call(arguments);
            event = event.toLowerCase();
            var preventDefault = false;
            if (this.events.hasOwnProperty(event)) {
                each(this.events[event], function (callback) {
                    preventDefault = callback.apply(this, args.slice(1)) === false || preventDefault;
                });
            }
            if (event != 'catchall') {
                args.unshift('catchAll');
                preventDefault = this.fire.apply(this, args) === false || preventDefault;
            }
            return !preventDefault;
        },

        /**
         * Read webkit dataTransfer object
         * @param event
         */
        webkitReadDataTransfer: function (event) {
            var $ = this;
            var queue = event.dataTransfer.items.length;
            var files = [];
            each(event.dataTransfer.items, function (item) {
                var entry = item.webkitGetAsEntry();
                if (!entry) {
                    decrement();
                    return ;
                }
                if (entry.isFile) {
                    // due to a bug in Chrome's File System API impl - #149735
                    fileReadSuccess(item.getAsFile(), entry.fullPath);
                } else {
                    entry.createReader().readEntries(readSuccess, readError);
                }
            });
            function readSuccess(entries) {
                queue += entries.length;
                each(entries, function(entry) {
                    if (entry.isFile) {
                        var fullPath = entry.fullPath;
                        entry.file(function (file) {
                            fileReadSuccess(file, fullPath);
                        }, readError);
                    } else if (entry.isDirectory) {
                        entry.createReader().readEntries(readSuccess, readError);
                    }
                });
                decrement();
            }
            function fileReadSuccess(file, fullPath) {
                // relative path should not start with "/"
                file.relativePath = fullPath.substring(1);
                files.push(file);
                decrement();
            }
            function readError(fileError) {
                throw fileError;
            }
            function decrement() {
                if (--queue == 0) {
                    $.addFiles(files, event);
                }
            }
        },

        /**
         * Generate unique identifier for a file
         * @function
         * @param {FlowFile} file
         * @returns {string}
         */
        generateUniqueIdentifier: function (file) {
            var custom = this.opts.generateUniqueIdentifier;
            if (typeof custom === 'function') {
                return custom(file);
            }
            // Some confusion in different versions of Firefox
            var relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name;
            return file.size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '');
        },

        /**
         * Upload next chunk from the queue
         * @function
         * @returns {boolean}
         * @private
         */
        uploadNextChunk: function (preventEvents) {
            // In some cases (such as videos) it's really handy to upload the first
            // and last chunk of a file quickly; this let's the server check the file's
            // metadata and determine if there's even a point in continuing.
            var found = false;
            if (this.opts.prioritizeFirstAndLastChunk) {
                each(this.files, function (file) {
                    if (!file.paused && file.chunks.length &&
                        file.chunks[0].status() === 'pending' &&
                        file.chunks[0].preprocessState === 0) {
                        file.chunks[0].send();
                        found = true;
                        return false;
                    }
                    if (!file.paused && file.chunks.length > 1 &&
                        file.chunks[file.chunks.length - 1].status() === 'pending' &&
                        file.chunks[0].preprocessState === 0) {
                        file.chunks[file.chunks.length - 1].send();
                        found = true;
                        return false;
                    }
                });
                if (found) {
                    return found;
                }
            }

            // Now, simply look for the next, best thing to upload
            each(this.files, function (file) {
                if (!file.paused) {
                    each(file.chunks, function (chunk) {
                        if (chunk.status() === 'pending' && chunk.preprocessState === 0) {
                            chunk.send();
                            found = true;
                            return false;
                        }
                    });
                }
                if (found) {
                    return false;
                }
            });
            if (found) {
                return true;
            }

            // The are no more outstanding chunks to upload, check is everything is done
            var outstanding = false;
            each(this.files, function (file) {
                if (!file.isComplete()) {
                    outstanding = true;
                    return false;
                }
            });
            if (!outstanding && !preventEvents) {
                // All chunks have been uploaded, complete
                async(function () {
                    this.fire('complete');
                }, this);
            }
            return false;
        },


        /**
         * Assign a browse action to one or more DOM nodes.
         * @function
         * @param {Element|Array.<Element>} domNodes
         * @param {boolean} isDirectory Pass in true to allow directories to
         * @param {boolean} singleFile prevent multi file upload
         * @param {Object} attributes set custom attributes:
         *  http://www.w3.org/TR/html-markup/input.file.html#input.file-attributes
         *  eg: accept: 'image/*'
         * be selected (Chrome only).
         */
        assignBrowse: function (domNodes, isDirectory, singleFile, attributes) {
            if (typeof domNodes.length === 'undefined') {
                domNodes = [domNodes];
            }

            each(domNodes, function (domNode) {
                var input;
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
                if (!this.opts.singleFile && !singleFile) {
                    input.setAttribute('multiple', 'multiple');
                }
                if (isDirectory) {
                    input.setAttribute('webkitdirectory', 'webkitdirectory');
                }
                each(attributes, function (value, key) {
                    input.setAttribute(key, value);
                });
                // When new files are added, simply append them to the overall list
                var $ = this;
                input.addEventListener('change', function (e) {
                    $.addFiles(e.target.files, e);
                    e.target.value = '';
                }, false);
            }, this);
        },

        /**
         * Assign one or more DOM nodes as a drop target.
         * @function
         * @param {Element|Array.<Element>} domNodes
         */
        assignDrop: function (domNodes) {
            if (typeof domNodes.length === 'undefined') {
                domNodes = [domNodes];
            }
            each(domNodes, function (domNode) {
                domNode.addEventListener('dragover', this.preventEvent, false);
                domNode.addEventListener('dragenter', this.preventEvent, false);
                domNode.addEventListener('drop', this.onDrop, false);
            }, this);
        },

        /**
         * Un-assign drop event from DOM nodes
         * @function
         * @param domNodes
         */
        unAssignDrop: function (domNodes) {
            if (typeof domNodes.length === 'undefined') {
                domNodes = [domNodes];
            }
            each(domNodes, function (domNode) {
                domNode.removeEventListener('dragover', this.preventEvent);
                domNode.removeEventListener('dragenter', this.preventEvent);
                domNode.removeEventListener('drop', this.onDrop);
            }, this);
        },

        /**
         * Returns a boolean indicating whether or not the instance is currently
         * uploading anything.
         * @function
         * @returns {boolean}
         */
        isUploading: function () {
            var uploading = false;
            each(this.files, function (file) {
                if (file.isUploading()) {
                    uploading = true;
                    return false;
                }
            });
            return uploading;
        },

        /**
         * should upload next chunk
         * @function
         * @returns {boolean|number}
         */
        _shouldUploadNext: function () {
            var num = 0;
            var should = true;
            var simultaneousUploads = this.opts.simultaneousUploads;
            each(this.files, function (file) {
                each(file.chunks, function(chunk) {
                    if (chunk.status() === 'uploading') {
                        num++;
                        if (num >= simultaneousUploads) {
                            should = false;
                            return false;
                        }
                    }
                });
            });
            // if should is true then return uploading chunks's length
            return should && num;
        },

        /**
         * Start or resume uploading.
         * @function
         */
        upload: function () {
            // Make sure we don't start too many uploads at once
            var ret = this._shouldUploadNext();
            if (ret === false) {
                return;
            }
            // Kick off the queue
            this.fire('uploadStart');
            var started = false;
            for (var num = 1; num <= this.opts.simultaneousUploads - ret; num++) {
                started = this.uploadNextChunk(true) || started;
            }
            if (!started) {
                async(function () {
                    this.fire('complete');
                }, this);
            }
        },

        /**
         * Resume uploading.
         * @function
         */
        resume: function () {
            each(this.files, function (file) {
                file.resume();
            });
        },

        /**
         * Pause uploading.
         * @function
         */
        pause: function () {
            each(this.files, function (file) {
                file.pause();
            });
        },

        /**
         * Cancel upload of all FlowFile objects and remove them from the list.
         * @function
         */
        cancel: function () {
            for (var i = this.files.length - 1; i >= 0; i--) {
                this.files[i].cancel();
            }
        },

        /**
         * Returns a number between 0 and 1 indicating the current upload progress
         * of all files.
         * @function
         * @returns {number}
         */
        progress: function () {
            var totalDone = 0;
            var totalSize = 0;
            // Resume all chunks currently being uploaded
            each(this.files, function (file) {
                totalDone += file.progress() * file.size;
                totalSize += file.size;
            });
            return totalSize > 0 ? totalDone / totalSize : 0;
        },

        /**
         * Add a HTML5 File object to the list of files.
         * @function
         * @param {File} file
         * @param {Event} [event] event is optional
         */
        addFile: function (file, event) {
            this.addFiles([file], event);
        },

        /**
         * Add a HTML5 File object to the list of files.
         * @function
         * @param {FileList|Array} fileList
         * @param {Event} [event] event is optional
         */
        addFiles: function (fileList, event) {
            var files = [];
            each(fileList, function (fileEntry) {
                var file = fileEntry.file || fileEntry;
                var id = fileEntry.id || this.generateUniqueIdentifier(file);
                var attrs = fileEntry.attrs || {};

                // Directories have size `0` and name `.`
                // Ignore already added files
                if (!(file.size % 4096 === 0 && (file.name === '.' || file.fileName === '.'))) {
                    if (!this.getFromUniqueIdentifier(id)) {
                        var f = new FlowFile(this, file, attrs);
                        f.uniqueIdentifier = id;
                        if (this.fire('fileAdded', f, event)) {
                            files.push(f);
                        }
                    }
                }
            }, this);
            if (this.fire('filesAdded', files, event)) {
                each(files, function (file) {
                    if (this.opts.singleFile && this.files.length > 0) {
                        this.removeFile(this.files[0]);
                    }
                    this.files.push(file);
                }, this);
            }
            this.fire('filesSubmitted', files, event);
        },


        /**
         * Cancel upload of a specific FlowFile object from the list.
         * @function
         * @param {FlowFile} file
         */
        removeFile: function (file) {
            for (var i = this.files.length - 1; i >= 0; i--) {
                if (this.files[i] === file) {
                    this.files.splice(i, 1);
                    this.fire("fileRemoved", file);
                    file.abort();
                }
            }
        },

        /**
         * Look up a FlowFile object by its unique identifier.
         * @function
         * @param {string} uniqueIdentifier
         * @returns {boolean|FlowFile} false if file was not found
         */
        getFromUniqueIdentifier: function (uniqueIdentifier) {
            var ret = false;
            each(this.files, function (file) {
                if (file.uniqueIdentifier === uniqueIdentifier) {
                    ret = file;
                }
            });
            return ret;
        },

        findFile: function(matchFn){
            var found = false;
            each(this.files, function(file) {
                if (matchFn(file)) {
                    found = true;
                }
            });
            return found;
        },

        /**
         * Returns the total size of all files in bytes.
         * @function
         * @returns {number}
         */
        getSize: function () {
            var totalSize = 0;
            each(this.files, function (file) {
                totalSize += file.size;
            });
            return totalSize;
        },

        /**
         * Returns the total size uploaded of all files in bytes.
         * @function
         * @returns {number}
         */
        sizeUploaded: function () {
            var size = 0;
            each(this.files, function (file) {
                size += file.sizeUploaded();
            });
            return size;
        },

        /**
         * Returns remaining time to upload all files in seconds. Accuracy is based on average speed.
         * If speed is zero, time remaining will be equal to positive infinity `Number.POSITIVE_INFINITY`
         * @function
         * @returns {number}
         */
        timeRemaining: function () {
            var sizeDelta = 0;
            var averageSpeed = 0;
            each(this.files, function (file) {
                if (!file.paused && !file.error) {
                    sizeDelta += file.size - file.sizeUploaded();
                    averageSpeed += file.averageSpeed;
                }
            });
            if (sizeDelta && !averageSpeed) {
                return Number.POSITIVE_INFINITY;
            }
            if (!sizeDelta && !averageSpeed) {
                return 0;
            }
            return Math.floor(sizeDelta / averageSpeed);
        }
    };

    /**
     * FlowFile class
     * @name FlowFile
     * @param {Flow} flowObj
     * @param {File} file
     * @constructor
     */
    function FlowFile(flowObj, file, attrs) {

        /**
         * Reference to parent Flow instance
         * @type {Flow}
         */
        this.flowObj = flowObj;

        /**
         * Reference to file
         * @type {File}
         */
        this.file = file;

        /**
         * Extra parameters to send along
         * @type {dict}
         */
        this.attrs = attrs || {};

        /**
         * File name. Some confusion in different versions of Firefox
         * @type {string}
         */
        this.name = file.fileName || file.name;

        /**
         * File size
         * @type {number}
         */
        this.size = file.size;

        /**
         * Relative file path
         * @type {string}
         */
        this.relativePath = file.relativePath || file.webkitRelativePath || this.name;

        /**
         * File unique identifier
         * @type {string}
         */
        this.uniqueIdentifier = ""; //flowObj.generateUniqueIdentifier(file);

        /**
         * List of chunks
         * @type {Array.<FlowChunk>}
         */
        this.chunks = [];

        /**
         * Indicated if file is paused
         * @type {boolean}
         */
        this.paused = false;

        /**
         * Indicated if file has encountered an error
         * @type {boolean}
         */
        this.error = false;

        /**
         * Average upload speed
         * @type {number}
         */
        this.averageSpeed = 0;

        /**
         * Current upload speed
         * @type {number}
         */
        this.currentSpeed = 0;

        /**
         * Date then progress was called last time
         * @type {number}
         * @private
         */
        this._lastProgressCallback = Date.now();

        /**
         * Previously uploaded file size
         * @type {number}
         * @private
         */
        this._prevUploadedSize = 0;

        /**
         * Holds previous progress
         * @type {number}
         * @private
         */
        this._prevProgress = 0;

        /**
         * Holds the computed MD5 hash
         * @type {string}
         */
        this.hash = "";

        /**
         * Reference to spark object.
         * @type {Spark}
         */
        this.spark = new SparkMD5.ArrayBuffer();

        this.bootstrap();
    }

    FlowFile.prototype = {
        /**
         * Update speed parameters
         * @link http://stackoverflow.com/questions/2779600/how-to-estimate-download-time-remaining-accurately
         * @function
         */
        measureSpeed: function () {
            var timeSpan = Date.now() - this._lastProgressCallback;
            if (!timeSpan) {
                return ;
            }
            var smoothingFactor = this.flowObj.opts.speedSmoothingFactor;
            var uploaded = this.sizeUploaded();
            // Prevent negative upload speed after file upload resume
            this.currentSpeed = Math.max((uploaded - this._prevUploadedSize) / timeSpan * 1000, 0);
            this.averageSpeed = smoothingFactor * this.currentSpeed + (1 - smoothingFactor) * this.averageSpeed;
            this._prevUploadedSize = uploaded;
        },

        /**
         * For internal usage only.
         * Callback when something happens within the chunk.
         * @function
         * @param {FlowChunk} chunk
         * @param {string} event can be 'progress', 'success', 'error' or 'retry'
         * @param {string} [message]
         */
        chunkEvent: function (chunk, event, message) {
            switch (event) {
            case 'progress':
                if (Date.now() - this._lastProgressCallback <
                    this.flowObj.opts.progressCallbacksInterval) {
                    break;
                }
                this.measureSpeed();
                this.flowObj.fire('fileProgress', this, chunk);
                this.flowObj.fire('progress');
                this._lastProgressCallback = Date.now();
                break;
            case 'error':
                this.error = true;
                this.abort(true);
                this.flowObj.fire('fileError', this, message, chunk);
                this.flowObj.fire('error', message, this, chunk);
                break;
            case 'success':
                if (this.error) {
                    return;
                }
                this.measureSpeed();
                this.flowObj.fire('fileProgress', this, chunk);
                this.flowObj.fire('progress');
                this._lastProgressCallback = Date.now();
                if (this.isComplete()) {
                    this.currentSpeed = 0;
                    this.averageSpeed = 0;
                    this.flowObj.fire('fileSuccess', this, message, chunk);
                }
                break;
            case 'retry':
                this.flowObj.fire('fileRetry', this, chunk);
                break;
            }
        },

        /**
         * Pause file upload
         * @function
         */
        pause: function() {
            this.paused = true;
            this.abort();
        },

        /**
         * Resume file upload
         * @function
         */
        resume: function() {
            this.paused = false;
            this.flowObj.upload();
        },

        /**
         * Abort current upload
         * @function
         */
        abort: function (reset) {
            this.currentSpeed = 0;
            this.averageSpeed = 0;
            var chunks = this.chunks;
            if (reset) {
                this.chunks = [];
            }
            each(chunks, function (c) {
                if (c.status() === 'uploading') {
                    c.abort();
                    this.flowObj.uploadNextChunk();
                }
            }, this);
        },

        /**
         * Cancel current upload and remove from a list
         * @function
         */
        cancel: function () {
            this.flowObj.removeFile(this);
        },

        /**
         * Retry aborted file upload
         * @function
         */
        retry: function () {
            this.bootstrap();
            this.flowObj.upload();
        },

        /**
         * Clear current chunks and slice file again
         * @function
         */
        bootstrap: function () {
            this.abort(true);
            this.error = false;
            // Rebuild stack of chunks from file
            this._prevProgress = 0;
            var round = this.flowObj.opts.forceChunkSize ? Math.ceil : Math.floor;
            var chunks = Math.max(
                round(this.file.size / this.flowObj.opts.chunkSize), 1
            );
            for (var offset = 0; offset < chunks; offset++) {
                this.chunks.push(
                    new FlowChunk(this.flowObj, this, offset)
                );
            }
        },

        /**
         * Get current upload progress status
         * @function
         * @returns {number} from 0 to 1
         */
        progress: function () {
            if (this.error) {
                return 1;
            }
            if (this.chunks.length === 1) {
                this._prevProgress = Math.max(this._prevProgress, this.chunks[0].progress());
                return this._prevProgress;
            }
            // Sum up progress across everything
            var bytesLoaded = 0;
            each(this.chunks, function (c) {
                // get chunk progress relative to entire file
                bytesLoaded += c.progress() * (c.endByte - c.startByte);
            });
            var percent = bytesLoaded / this.size;
            // We don't want to lose percentages when an upload is paused
            this._prevProgress = Math.max(this._prevProgress, percent > 0.9999 ? 1 : percent);
            return this._prevProgress;
        },

        /**
         * Indicates if file is being uploaded at the moment
         * @function
         * @returns {boolean}
         */
        isUploading: function () {
            var uploading = false;
            each(this.chunks, function (chunk) {
                if (chunk.status() === 'uploading') {
                    uploading = true;
                    return false;
                }
            });
            return uploading;
        },

        /**
         * Indicates if file is has finished uploading and received a response
         * @function
         * @returns {boolean}
         */
        isComplete: function () {
            var outstanding = false;
            each(this.chunks, function (chunk) {
                var status = chunk.status();
                if (status === 'pending' || status === 'uploading' || chunk.preprocessState === 1) {
                    outstanding = true;
                    return false;
                }
            });
            return !outstanding;
        },

        /**
         * Count total size uploaded
         * @function
         * @returns {number}
         */
        sizeUploaded: function () {
            var size = 0;
            each(this.chunks, function (chunk) {
                size += chunk.sizeUploaded();
            });
            return size;
        },

        /**
         * Returns remaining time to finish upload file in seconds. Accuracy is based on average speed.
         * If speed is zero, time remaining will be equal to positive infinity `Number.POSITIVE_INFINITY`
         * @function
         * @returns {number}
         */
        timeRemaining: function () {
            if (this.paused || this.error) {
                return 0;
            }
            var delta = this.size - this.sizeUploaded();
            if (delta && !this.averageSpeed) {
                return Number.POSITIVE_INFINITY;
            }
            if (!delta && !this.averageSpeed) {
                return 0;
            }
            return Math.floor(delta / this.averageSpeed);
        },

        /**
         * Get file type
         * @function
         * @returns {string}
         */
        getType: function () {
            return this.file.type && this.file.type.split('/')[1];
        },

        /**
         * Get file extension
         * @function
         * @returns {string}
         */
        getExtension: function () {
            return this.name.substr((~-this.name.lastIndexOf(".") >>> 0) + 2).toLowerCase();
        }
    };








    /**
     * Class for storing a single chunk
     * @name FlowChunk
     * @param {Flow} flowObj
     * @param {FlowFile} fileObj
     * @param {number} offset
     * @constructor
     */
    function FlowChunk(flowObj, fileObj, offset) {

        /**
         * Reference to parent flow object
         * @type {Flow}
         */
        this.flowObj = flowObj;

        /**
         * Reference to parent FlowFile object
         * @type {FlowFile}
         */
        this.fileObj = fileObj;

        /**
         * File size
         * @type {number}
         */
        this.fileObjSize = fileObj.size;

        /**
         * File offset
         * @type {number}
         */
        this.offset = offset;

        /**
         * Indicates if chunk existence was checked on the server
         * @type {boolean}
         */
        this.tested = false;

        /**
         * Number of retries performed
         * @type {number}
         */
        this.retries = 0;

        /**
         * Pending retry
         * @type {boolean}
         */
        this.pendingRetry = false;

        /**
         * Preprocess state
         * @type {number} 0 = unprocessed, 1 = processing, 2 = finished
         */
        this.preprocessState = 0;

        /**
         * Bytes transferred from total request size
         * @type {number}
         */
        this.loaded = 0;

        /**
         * Total request size
         * @type {number}
         */
        this.total = 0;

        /**
         * Hash of chunk
         * @type {string}
         */
        this.hash = "";

        /**
         * Size of a chunk
         * @type {number}
         */
        var chunkSize = this.flowObj.opts.chunkSize;

        /**
         * Chunk start byte in a file
         * @type {number}
         */
        this.startByte = this.offset * chunkSize;

        /**
         * Chunk end byte in a file
         * @type {number}
         */
        this.endByte = Math.min(this.fileObjSize, (this.offset + 1) * chunkSize);

        /**
         * XMLHttpRequest
         * @type {XMLHttpRequest}
         */
        this.xhr = null;

        if (this.fileObjSize - this.endByte < chunkSize &&
            !this.flowObj.opts.forceChunkSize) {
            // The last chunk will be bigger than the chunk size,
            // but less than 2*chunkSize
            this.endByte = this.fileObjSize;
        }

        var $ = this;


        /**
         * Send chunk event
         * @param event
         * @param {...} args arguments of a callback
         */
        this.event = function (event, args) {
            args = Array.prototype.slice.call(arguments);
            args.unshift($);
            $.fileObj.chunkEvent.apply($.fileObj, args);
        };
        /**
         * Catch progress event
         * @param {ProgressEvent} event
         */
        this.progressHandler = function(event) {
            if (event.lengthComputable) {
                $.loaded = event.loaded ;
                $.total = event.total;
            }
            $.event('progress', event);
        };

        /**
         * Catch test event
         * @param {Event} event
         */
        this.testHandler = function(event) {
            var status = $.status(true);
            if (status === 'error') {
                $.event(status, $.message());
                $.flowObj.uploadNextChunk();
            } else if (status === 'success') {
                $.tested = true;
                $.event(status, $.message());
                $.flowObj.uploadNextChunk();
            } else if (!$.fileObj.paused) {
                // Error might be caused by file pause method
                // Chunks does not exist on the server side
                $.tested = true;
                $.send();
            }
        };

        /**
         * Upload has stopped
         * @param {Event} event
         */
        this.doneHandler = function(event) {
            var status = $.status();
            if (status === 'success' || status === 'error') {
                $.event(status, $.message());
                $.flowObj.uploadNextChunk();
            } else {
                $.event('retry', $.message());
                $.pendingRetry = true;
                $.abort();
                $.retries++;
                var retryInterval = $.flowObj.opts.chunkRetryInterval;
                if (retryInterval !== null) {
                    setTimeout(function () {
                        $.send();
                    }, retryInterval);
                } else {
                    $.send();
                }
            }
        };
    }

    FlowChunk.prototype = {
        /**
         * Get params for a request
         * @function
         */
        getParams: function () {
            return {
                flowChunkNumber: this.offset + 1,
                flowChunkSize: this.flowObj.opts.chunkSize,
                flowCurrentChunkSize: this.endByte - this.startByte,
                flowTotalSize: this.fileObjSize,
                flowIdentifier: this.fileObj.uniqueIdentifier,
                flowFilename: this.fileObj.name,
                flowRelativePath: this.fileObj.relativePath,
                flowTotalChunks: this.fileObj.chunks.length
            };
        },

        /**
         * Get target option with query params
         * @function
         * @param params
         * @returns {string}
         */
        getTarget: function(target, params){
            if(target.indexOf('?') < 0) {
                target += '?';
            } else {
                target += '&';
            }
            return target + params.join('&');
        },

        /**
         * Makes a GET request without any data to see if the chunk has already
         * been uploaded in a previous session
         * @function
         */
        test: function () {
            // Set up request and listen for event
            this.xhr = new XMLHttpRequest();
            this.xhr.addEventListener("load", this.testHandler, false);
            this.xhr.addEventListener("error", this.testHandler, false);
            var testMethod = evalOpts(this.flowObj.opts.testMethod, this.fileObj, this);
            var data = this.prepareXhrRequest(testMethod, true);
            this.xhr.send(data);
        },

        /**
         * Finish preprocess state
         * @function
         */
        preprocessFinished: function () {
            this.preprocessState = 2;
            this.send();
        },

        /**
         * Uploads the actual data in a POST call
         * @function
         */
        send: function () {
            var preprocess = this.flowObj.opts.preprocess;
            if (typeof preprocess === 'function') {
                switch (this.preprocessState) {
                case 0:
                    this.preprocessState = 1;
                    preprocess(this);
                    return;
                case 1:
                    return;
                }
            }
            if (this.flowObj.opts.testChunks && !this.tested) {
                this.test();
                return;
            }

            this.loaded = 0;
            this.total = 0;
            this.pendingRetry = false;

            var func = (this.fileObj.file.slice ? 'slice' :
                        (this.fileObj.file.mozSlice ? 'mozSlice' :
                         (this.fileObj.file.webkitSlice ? 'webkitSlice' :
                          'slice')));
            var bytes = this.fileObj.file[func](this.startByte, this.endByte, this.fileObj.file.type);
            var fr = new FileReader();
            this.xhr = new XMLHttpRequest();
            var xhr = this.xhr;
            var who = this;
            this.xhr.upload.addEventListener('progress', this.progressHandler, false);
            this.xhr.onreadystatechange = function() {
                var myxhr = xhr;
                var me = who;
                if (myxhr.readyState === 4 && myxhr.status === 200) {
                    var data = JSON.parse(myxhr.responseText);
                    if (data.done) {
                        me.fileObj.file_id = data.file_id;
                    }
                }
            };
            this.xhr.addEventListener("load", this.doneHandler, false);
            this.xhr.addEventListener("error", this.doneHandler, false);
            var self = this;
            fr.onload = function(e) {
                self.hash = SparkMD5.ArrayBuffer.hash(e.target.result);
                self.fileObj.spark.append(e.target.result);
                if (self.fileObj.size === self.endByte) {
                    // Last block so compute final file hash
                    self.fileObj.hash = self.fileObj.spark.end();
                }

                // Set up request and listen for event
                var uploadMethod = evalOpts(self.flowObj.opts.uploadMethod, self.fileObj, self);
                var data = self.prepareXhrRequest(uploadMethod, false, self.flowObj.opts.method, bytes);
                self.xhr.send(data);
            };
            fr.readAsArrayBuffer(bytes);
        },

        /**
         * Abort current xhr request
         * @function
         */
        abort: function () {
            // Abort and reset
            var xhr = this.xhr;
            if (xhr) {
                xhr.abort();
                this.xhr = null;
            }
        },

        /**
         * Retrieve current chunk upload status
         * @function
         * @returns {string} 'pending', 'uploading', 'success', 'error'
         */
        status: function (isTest) {
            if (this.pendingRetry || this.preprocessState === 1) {
                // if pending retry then that's effectively the same as actively uploading,
                // there might just be a slight delay before the retry starts
                return 'uploading';
            } else if (!this.xhr) {
                return 'pending';
            } else if (this.xhr.readyState < 4) {
                // Status is really 'OPENED', 'HEADERS_RECEIVED'
                // or 'LOADING' - meaning that stuff is happening
                return 'uploading';
            } else {
                if (this.flowObj.opts.successStatuses.indexOf(this.xhr.status) > -1) {
                    // HTTP 200, perfect
                    // HTTP 202 Accepted - The request has been accepted for processing, but the processing has not been completed.
                    return 'success';
                } else if (this.flowObj.opts.permanentErrors.indexOf(this.xhr.status) > -1 ||
                           !isTest && this.retries >= this.flowObj.opts.maxChunkRetries) {
                    // HTTP 415/500/501, permanent error
                    return 'error';
                } else {
                    // this should never happen, but we'll reset and queue a retry
                    // a likely case for this would be 503 service unavailable
                    this.abort();
                    return 'pending';
                }
            }
        },

        /**
         * Get response from xhr request
         * @function
         * @returns {String}
         */
        message: function () {
            return this.xhr ? this.xhr.responseText : '';
        },

        /**
         * Get upload progress
         * @function
         * @returns {number}
         */
        progress: function () {
            if (this.pendingRetry) {
                return 0;
            }
            var s = this.status();
            if (s === 'success' || s === 'error') {
                return 1;
            } else if (s === 'pending') {
                return 0;
            } else {
                return this.total > 0 ? this.loaded / this.total : 0;
            }
        },

        /**
         * Count total size uploaded
         * @function
         * @returns {number}
         */
        sizeUploaded: function () {
            var size = this.endByte - this.startByte;
            // can't return only chunk.loaded value, because it is bigger than chunk size
            if (this.status() !== 'success') {
                size = this.progress() * size;
            }
            return size;
        },

        /**
         * Prepare Xhr request. Set query, headers and data
         * @param {string} method GET or POST
         * @param {bool} isTest is this a test request
         * @param {string} [paramsMethod] octet or form
         * @param {Blob} [blob] to send
         * @returns {FormData|Blob|Null} data to send
         */
        prepareXhrRequest: function(method, isTest, paramsMethod, blob) {
            // Add data from the query options
            var query = evalOpts(this.flowObj.opts.query, this.fileObj, this, isTest);
            query = extend(this.getParams(), query);

            var target = evalOpts(this.flowObj.opts.target, this.fileObj, this, isTest);
            var data = null;
            if (method === 'GET' || paramsMethod === 'octet') {
                // Add data from the query options
                var params = [];
                each(query, function (v, k) {
                    params.push([encodeURIComponent(k), encodeURIComponent(v)].join('='));
                });
                each(this.fileObj.attrs, function(v, k) {
                    params.push([encodeURIComponent(k), encodeURIComponent(v)].join('='));
                });
                target = this.getTarget(target, params);
                data = blob || null;
            } else {
                // Add data from the query options
                data = new FormData();
                each(query, function (v, k) {
                    data.append(k, v);
                });
                each(this.fileObj.attrs, function(v, k) {
                    data.append(k, v);
                });
                data.append("chunkHash", this.hash);
                data.append("fileHash", this.fileObj.hash);
                data.append(this.flowObj.opts.fileParameterName, blob, this.fileObj.file.name);
            }

            this.xhr.open(method, target, true);
            this.xhr.withCredentials = this.flowObj.opts.withCredentials;

            // Add data from header options
            each(evalOpts(this.flowObj.opts.headers, this.fileObj, this, isTest), function (v, k) {
                this.xhr.setRequestHeader(k, v);
            }, this);

            return data;
        }
    };

    /**
     * Remove value from array
     * @param array
     * @param value
     */
    function arrayRemove(array, value) {
        var index = array.indexOf(value);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    /**
     * If option is a function, evaluate it with given params
     * @param {*} data
     * @param {...} args arguments of a callback
     * @returns {*}
     */
    function evalOpts(data, args) {
        if (typeof data === "function") {
            // `arguments` is an object, not array, in FF, so:
            args = Array.prototype.slice.call(arguments);
            data = data.apply(null, args.slice(1));
        }
        return data;
    }
    Flow.evalOpts = evalOpts;

    /**
     * Execute function asynchronously
     * @param fn
     * @param context
     */
    function async(fn, context) {
        setTimeout(fn.bind(context), 0);
    }

    /**
     * Extends the destination object `dst` by copying all of the properties from
     * the `src` object(s) to `dst`. You can specify multiple `src` objects.
     * @function
     * @param {Object} dst Destination object.
     * @param {...Object} src Source object(s).
     * @returns {Object} Reference to `dst`.
     */
    function extend(dst, src) {
        each(arguments, function(obj) {
            if (obj !== dst) {
                each(obj, function(value, key){
                    dst[key] = value;
                });
            }
        });
        return dst;
    }
    Flow.extend = extend;

    /**
     * Iterate each element of an object
     * @function
     * @param {Array|Object} obj object or an array to iterate
     * @param {Function} callback first argument is a value and second is a key.
     * @param {Object=} context Object to become context (`this`) for the iterator function.
     */
    function each(obj, callback, context) {
        if (!obj) {
            return ;
        }
        var key;
        // Is Array?
        if (typeof(obj.length) !== 'undefined') {
            for (key = 0; key < obj.length; key++) {
                if (callback.call(context, obj[key], key) === false) {
                    return ;
                }
            }
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) {
                    return ;
                }
            }
        }
    }
    Flow.each = each;

    /**
     * FlowFile constructor
     * @type {FlowFile}
     */
    Flow.FlowFile = FlowFile;

    /**
     * FlowFile constructor
     * @type {FlowChunk}
     */
    Flow.FlowChunk = FlowChunk;

    /**
     * Library version
     * @type {string}
     */
    Flow.version = '2.6.2';

    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        // Expose Flow as module.exports in loaders that implement the Node
        // module pattern (including browserify). Do not create the global, since
        // the user will be storing it themselves locally, and globals are frowned
        // upon in the Node module world.
        module.exports = Flow;
    } else {
        // Otherwise expose Flow to the global object as usual
        window.Flow = Flow;

        // Register as a named AMD module, since Flow can be concatenated with other
        // files that may use define, but not via a proper concatenation script that
        // understands anonymous AMD modules. A named AMD is safest and most robust
        // way to register. Lowercase flow is used because AMD module names are
        // derived from file names, and Flow is normally delivered in a lowercase
        // file name. Do this after creating the global so that if an AMD module wants
        // to call noConflict to hide this version of Flow, it will work.
        if ( typeof define === "function" && define.amd ) {
            define( "flow", [], function () { return Flow; } );
        }
    }
})(window, document);

(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals (with support for web workers)
        var glob;

        try {
            glob = window;
        } catch (e) {
            glob = self;
        }

        glob.SparkMD5 = factory();
    }
}(function (undefined) {

    'use strict';

    ////////////////////////////////////////////////////////////////////////////

    /*
     * Fastest md5 implementation around (JKM md5)
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */

    /* this function is much faster,
      so if possible we use it. Some IEs
      are the only ones I know of that
      need the idiotic second function,
      generated by an if clause.  */
    var add32 = function (a, b) {
        return (a + b) & 0xFFFFFFFF;
    },

    cmn = function (q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    },

    ff = function (a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    },

    gg = function (a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    },

    hh = function (a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    },

    ii = function (a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    },

    md5cycle = function (x, k) {
        var a = x[0],
            b = x[1],
            c = x[2],
            d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    },

    /* there needs to be support for Unicode here,
       * unless we pretend that we can redefine the MD-5
       * algorithm for multi-byte characters (perhaps
       * by adding every four 16-bit characters and
       * shortening the sum to 32 bits). Otherwise
       * I suggest performing MD-5 as if every character
       * was two bytes--e.g., 0040 0025 = @%--but then
       * how will an ordinary MD-5 sum be matched?
       * There is no way to standardize text to something
       * like UTF-8 before transformation; speed cost is
       * utterly prohibitive. The JavaScript standard
       * itself needs to look at this: it should start
       * providing access to strings as preformed UTF-8
       * 8-bit unsigned value arrays.
       */
    md5blk = function (s) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    },

    md5blk_array = function (a) {
        var md5blks = [],
            i; /* Andy King said do it this way. */

        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
    },

    md51 = function (s) {
        var n = s.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);
        return state;
    },

    md51_array = function (a) {
        var n = a.length,
            state = [1732584193, -271733879, -1732584194, 271733878],
            i,
            length,
            tail,
            tmp,
            lo,
            hi;

        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }

        // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
        // containing the last element of the parent array if the sub array specified starts
        // beyond the length of the parent array - weird.
        // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
        a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);

        length = a.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= a[i] << ((i % 4) << 3);
        }

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Beware that the final length might not fit in 32 bits so we take care of that
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;

        md5cycle(state, tail);

        return state;
    },

    hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],

    rhex = function (n) {
        var s = '',
            j;
        for (j = 0; j < 4; j += 1) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    },

    hex = function (x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
            x[i] = rhex(x[i]);
        }
        return x.join('');
    },

    md5 = function (s) {
        return hex(md51(s));
    },



    ////////////////////////////////////////////////////////////////////////////

    /**
     * SparkMD5 OOP implementation.
     *
     * Use this class to perform an incremental md5, otherwise use the
     * static methods instead.
     */
    SparkMD5 = function () {
        // call reset to init the instance
        this.reset();
    };


    // In some cases the fast add32 function cannot be used..
    if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
        add32 = function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };
    }


    /**
     * Appends a string.
     * A conversion will be applied if an utf8 string is detected.
     *
     * @param {String} str The string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.append = function (str) {
        // converts the string to utf8 bytes if necessary
        if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
        }

        // then append as binary
        this.appendBinary(str);

        return this;
    };

    /**
     * Appends a binary string.
     *
     * @param {String} contents The binary string to be appended
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.appendBinary = function (contents) {
        this._buff += contents;
        this._length += contents.length;

        var length = this._buff.length,
            i;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._state, md5blk(this._buff.substring(i - 64, i)));
        }

        this._buff = this._buff.substr(i - 64);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     * Use the raw parameter to obtain the raw result instead of the hex one.
     *
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            i,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = !!raw ? this._state : hex(this._state);

        this.reset();

        return ret;
    };

    /**
     * Finish the final calculation based on the tail.
     *
     * @param {Array}  tail   The tail (will be modified)
     * @param {Number} length The length of the remaining buffer
     */
    SparkMD5.prototype._finish = function (tail, length) {
        var i = length,
            tmp,
            lo,
            hi;

        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(this._state, tail);
            for (i = 0; i < 16; i += 1) {
                tail[i] = 0;
            }
        }

        // Do the final computation based on the tail and length
        // Beware that the final length may not fit in 32 bits so we take care of that
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;

        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._state, tail);
    };

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5} The instance itself
     */
    SparkMD5.prototype.reset = function () {
        this._buff = '';
        this._length = 0;
        this._state = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Releases memory used by the incremental buffer and other aditional
     * resources. If you plan to use the instance again, use reset instead.
     */
    SparkMD5.prototype.destroy = function () {
        delete this._state;
        delete this._buff;
        delete this._length;
    };


    /**
     * Performs the md5 hash on a string.
     * A conversion will be applied if utf8 string is detected.
     *
     * @param {String}  str The string
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.hash = function (str, raw) {
        // converts the string to utf8 bytes if necessary
        if (/[\u0080-\uFFFF]/.test(str)) {
            str = unescape(encodeURIComponent(str));
        }

        var hash = md51(str);

        return !!raw ? hash : hex(hash);
    };

    /**
     * Performs the md5 hash on a binary string.
     *
     * @param {String}  content The binary string
     * @param {Boolean} raw     True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.hashBinary = function (content, raw) {
        var hash = md51(content);

        return !!raw ? hash : hex(hash);
    };

    /**
     * SparkMD5 OOP implementation for array buffers.
     *
     * Use this class to perform an incremental md5 ONLY for array buffers.
     */
    SparkMD5.ArrayBuffer = function () {
        // call reset to init the instance
        this.reset();
    };

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Appends an array buffer.
     *
     * @param {ArrayBuffer} arr The array to be appended
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.append = function (arr) {
        // TODO: we could avoid the concatenation here but the algorithm would be more complex
        //       if you find yourself needing extra performance, please make a PR.
        var buff = this._concatArrayBuffer(this._buff, arr),
            length = buff.length,
            i;

        this._length += arr.byteLength;

        for (i = 64; i <= length; i += 64) {
            md5cycle(this._state, md5blk_array(buff.subarray(i - 64, i)));
        }

        // Avoids IE10 weirdness (documented above)
        this._buff = (i - 64) < length ? buff.subarray(i - 64) : new Uint8Array(0);

        return this;
    };

    /**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     * Use the raw parameter to obtain the raw result instead of the hex one.
     *
     * @param {Boolean} raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.ArrayBuffer.prototype.end = function (raw) {
        var buff = this._buff,
            length = buff.length,
            tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            i,
            ret;

        for (i = 0; i < length; i += 1) {
            tail[i >> 2] |= buff[i] << ((i % 4) << 3);
        }

        this._finish(tail, length);
        ret = !!raw ? this._state : hex(this._state);

        this.reset();

        return ret;
    };

    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

    /**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
    SparkMD5.ArrayBuffer.prototype.reset = function () {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._state = [1732584193, -271733879, -1732584194, 271733878];

        return this;
    };

    /**
     * Releases memory used by the incremental buffer and other aditional
     * resources. If you plan to use the instance again, use reset instead.
     */
    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

    /**
     * Concats two array buffers, returning a new one.
     *
     * @param  {ArrayBuffer} first  The first array buffer
     * @param  {ArrayBuffer} second The second array buffer
     *
     * @return {ArrayBuffer} The new array buffer
     */
    SparkMD5.ArrayBuffer.prototype._concatArrayBuffer = function (first, second) {
        var firstLength = first.length,
            result = new Uint8Array(firstLength + second.byteLength);

        result.set(first);
        result.set(new Uint8Array(second), firstLength);

        return result;
    };

    /**
     * Performs the md5 hash on an array buffer.
     *
     * @param {ArrayBuffer} arr The array buffer
     * @param {Boolean}     raw True to get the raw result, false to get the hex result
     *
     * @return {String|Array} The result
     */
    SparkMD5.ArrayBuffer.hash = function (arr, raw) {
        var hash = md51_array(new Uint8Array(arr));

        return !!raw ? hash : hex(hash);
    };

    return SparkMD5;
}));
