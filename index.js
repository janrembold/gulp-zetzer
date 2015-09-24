'use strict';

var PLUGIN_NAME = 'gulp-zetzer';

var fs          = require('fs');
var gutil       = require('gulp-util');
var through     = require('through2');
var getFileSize = require("filesize");
var PluginError = gutil.PluginError;

var ZetzerParse     = require('zetzer/parse');
var ZetzerCompilers = require('zetzer/compilers');
var ZetzerProcess   = require('zetzer/process');


module.exports = function (opts) {
    if (!opts) {
        throw new PluginError(PLUGIN_NAME, 'Missing options!');
    }

    // extend options
    var options = {
        use_file_cache: true,
        quiet: false,
        partials: '.',
        templates: '.',
        env: {},
        dot_template_settings: {},
        meta_data_separator: /\r?\n\r?\n/
    };

    Object.prototype.extend = function (obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                this[i] = obj[i];
            }
        }
    };

    options.extend(opts);

    // init file cache
    var fileCache = {};
    var readFileCached = function(file) {
        if(typeof(fileCache[file]) === 'undefined' || !options.use_file_cache) {
            fileCache[file] = fs.readFileSync(file, 'utf8');
        }

        return fileCache[file];
    };

    function find_closest_match (folder, filename) {

        //TODO Check if folder exists
        //throw new PluginError(PLUGIN_NAME, 'Folder ' + folder + 'doesn't exist');

        var pattern = build_pattern(folder, filename);

        //TODO Check for real filepath (maybe by pattern)
        //var filepath = grunt.file.expand(pattern);

        //TODO Check if file exists
        //throw new PluginError(PLUGIN_NAME, 'File ' + pattern + 'doesn't exist');

        return pattern;
    }

    function build_pattern (folder, filename) {
        //TODO Replace this with node path functions

        var separator = "";
        if (folder) {
            separator = folder.length ? "/" : "";
        }
        var extension = has_extension(filename) ? "" : ".*";
        return folder + separator + filename + extension;
    }

    function has_extension (filename) {
        return filename.toString().match(/\.[0-9a-z]+$/i);
    }

    // setup zetzer parser
    var parse = new ZetzerParse(options.meta_data_separator);

    // setup zetzer compilers
    var compile = new ZetzerCompilers({
        read_content: function(input_file) { 
            return parse.content(readFileCached(input_file)); 
        },
        compilers: [
            require('zetzer/dot')({ template_settings: options.dot_template_settings }),
            require('zetzer/markdown')
        ]
    });

    // TODO Fix processing header data
    // setup zetzer processor
    var processFile = new ZetzerProcess({
        options: options,
        compile: compile,
        find_closest_match: find_closest_match,
        read_header: function(input_file) { 
            return parse.header(readFileCached(input_file)); 
        }
    });

    // iterate over files
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            var contents = processFile(file.relative).toString();
            file.contents = new Buffer(contents);

            if(!options.quite) {
                var filesize = getFileSize(Buffer.byteLength(contents));
                gutil.log("Processed",gutil.colors.cyan(file.relative),":",gutil.colors.magenta(filesize));
            }
        }

		cb(null, file);
	});
};
