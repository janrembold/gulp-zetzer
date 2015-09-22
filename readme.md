# gulp-zetzer [![Build Status](https://travis-ci.org/<%= githubUsername %>/gulp-zetzer.svg?branch=master)](https://travis-ci.org/<%= githubUsername %>/gulp-zetzer)

> My <%= superb %> gulp plugin


## Install

```
$ npm install --save-dev gulp-zetzer
```


## Usage

```js
var gulp = require('gulp');
var <%= camelPluginName %> = require('gulp-zetzer');

gulp.task('default', function () {
	return gulp.src('src/file.ext')
		.pipe(<%= camelPluginName %>())
		.pipe(gulp.dest('dist'));
});
```


## API

### <%= camelPluginName %>(options)

#### options

##### foo

Type: `boolean`  
Default: `false`

Lorem ipsum.


## License

MIT © [<%= name %>](<%= website %>)
