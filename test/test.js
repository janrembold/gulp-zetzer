'use strict';

var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var PassThrough = require('stream').PassThrough;
var path = require('path');
var zetzer = require('./../');

function getFile(filePath) {
    return new gutil.File({
        path:     filePath,
        base:     path.dirname(filePath),
        contents: fs.readFileSync(filePath)
    });
}

function getFixture(filePath) {
    return getFile(path.join('fixtures', filePath));
}

function getExpected(filePath) {
    return getFile(path.join('expected', filePath));
}

describe('gulp-zetzer', function() {
    describe('process files', function() {

        function compare(name, expectedName, done) {
            var stream = zetzer({
                partials: './fixtures/partials',
                templates: './fixtures/layouts',
                dot_template_settings: {
                    strip: false
                },
                env: {
                    env_string: 'Successful Environment String Test',
                    env_function: function() {
                        return 'Successful Environment Function Test';
                    }
                }
            });

            stream.on('data', function(newFile) {
                if (path.basename(newFile.path) === name) {
                    assert.equal(String(getExpected(expectedName).contents), String(newFile.contents));
                }
            });

            stream.write(getFixture(name));
        }

        it('various files', function(done) {
            compare('index.html', 'index.html', done);
            compare('index2.html', 'index2.html', done);
            done();
        });

    });

    describe('negative test:', function() {
        it('shouldn\'t work in stream mode', function(done) {
            var stream = zetzer({});
            var t;
            var fakeStream = new PassThrough();
            var fakeFile = new gutil.File({
                contents: fakeStream
            });
            fakeStream.end();

            stream.on('error', function() {
                clearTimeout(t);
                done();
            });

            t = setTimeout(function() {
                assert.fail('', '', 'Should throw error', '');
                done();
            }, 1000);

            stream.write(fakeFile);
        });
    });
});