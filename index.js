'use strict';

var PLUGIN_NAME = 'gulp-zetzer';

var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var _ = require('lodash')
var PluginError = gutil.PluginError;

var ZetzerParse = require('zetzer/parse');
var ZetzerCompilers = require('zetzer/compilers');
var ZetzerProcess = require('zetzer/process');


module.exports = function (opts) {
    if (!opts) {
        throw new PluginError(PLUGIN_NAME, 'Missing options!');
    }

    // extend default options
    var options = {
        use_file_cache: true,
        partials: '.',
        templates: '.',
        env: {},
        dot_template_settings: {},
        meta_data_separator: /\r?\n\r?\n/
    };
    _.assign(options, opts);

    // init file cache
    var fileCache = {};
    var readFileCached = function (file) {
        if (typeof(fileCache[file]) === 'undefined' || !options.use_file_cache) {
            fileCache[file] = fs.readFileSync(file, 'utf8');
        }

        return fileCache[file];
    };

    function find_closest_match(folder, filename) {
        // join folder and filename
        var filepath = path.join(folder, filename);

        // check if file exists
        if (!fs.existsSync(filepath)) {
            throw new PluginError(PLUGIN_NAME, 'File ' + filepath + ' does not exist');
        }

        return filepath;
    }

    // setup zetzer parser
    var parse = ZetzerParse(options.meta_data_separator);

    // setup zetzer compilers
    var compile = ZetzerCompilers({
        read_content: function (input_file) {
            return parse.content(readFileCached(input_file));
        },
        compilers: [
            require('zetzer/dot')({template_settings: options.dot_template_settings}),
            require('zetzer/markdown')
        ]
    });

    // setup zetzer processor
    var processFile = ZetzerProcess({
        options: options,
        compile: compile,
        find_closest_match: find_closest_match,
        read_header: function (input_file) {
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
            try {

                var contents = processFile(path.relative(file.cwd, file.path)).toString();
                file.contents = new Buffer(contents);

            } catch(error) {
                error.messageFormatted = gutil.colors.underline('Template: '+path.relative(file.cwd, file.path)) + '\n';
                error.messageFormatted += gutil.colors.red(error.message);

                process.stderr.write(error.messageFormatted + '\n');
                this.emit('error', new gutil.PluginError(PLUGIN_NAME, error));
                return cb();
            }
        }

        cb(null, file);
    });
};
