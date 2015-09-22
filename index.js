'use strict';

var PLUGIN_NAME = 'gulp-zetzer';
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var through = require('through2');
var _ = require('underscore');

var parse_setup = require('zetzer/parse');
var compilers_setup = require('zetzer/compilers');
var process_file_setup = require('zetzer/process');


module.exports = function (opts) {
    if (!opts) {
        throw new PluginError(PLUGIN_NAME, 'Missing options!');
    }

    var options = _.extend({
        partials: '.',
        templates: '.',
        env: {},
        dot_template_settings: {},
        meta_data_separator: /\r?\n\r?\n/
    }, opts);

    var parse = parse_setup(options.meta_data_separator);

    //var compile =  compilers_setup({
    //    read_content: _.compose(parse.content, grunt.file.read),
    //    compilers: [
    //        require("zetzer/dot")({
    //            template_settings: options.dot_template_settings
    //        }),
    //        require("zetzer/markdown")
    //    ]
    //});

    //var process_file = new process_file_setup({
    //    options: options,
    //    compile: compile,
    //    read_header: _.compose(parse.header, grunt.file.read),
    //    find_closest_match: file.find_closest_match
    //});

    function find_closest_match (folder, filename) {
        //if (!grunt.file.isDir(folder)) grunt.fail.warn("The folder " + folder + " does not exist.");
        //
        var pattern = build_pattern(folder, filename);

        //var filepath = grunt.file.expand(pattern);
        //
        //// Warn again if the resulting file doesn't exist
        //if (!filepath.length) grunt.fail.warn("The file " + pattern + " cannot be found.");

        //return filepath[0];
        //gutil.log('find_closest_match folder: ' + folder);
        //gutil.log('find_closest_match filename: ' + filename);
        //gutil.log('find_closest_match pattern: ' + pattern);
        return pattern;
    }

    function build_pattern (folder, filename) {
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

    //this.files.forEach(function (mapping) {
    //    var result = process_file(mapping.src).toString();
    //    grunt.file.write(mapping.dest, result);
    //});

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            //gutil.log('file is buffer: ' + file.path);
            //var prefixText = new Buffer('PREFIX TEXT - ');
            //file.contents = Buffer.concat([prefixText, file.contents]);

            //gutil.log('file');
            //gutil.log(file.relative);
            //gutil.log(file.contents);

            var compile =  compilers_setup({
                read_content: function(){ return parse.content(file.contents.toString()); }, //_.compose(parse.content, file.contents),
                compilers: [
                    require('zetzer/dot')({
                        template_settings: options.dot_template_settings
                    }),
                    require('zetzer/markdown')
                ]
            });

            var process_file = new process_file_setup({
                options: options,
                compile: compile,
                read_header: function(){ return parse.header(file.contents.toString()); }, //_.compose(parse.header, file.contents),
                find_closest_match: find_closest_match
            });

            console.log('process = ' + file.relative);
            var contents = process_file(file.relative).toString();
            file.contents = new Buffer(contents);
            //grunt.file.write(mapping.dest, result);
        }

		cb(null, file);
	});
};
