# gulp-zetzer

> Gulp plugin for [Zetzer][zetzer] - static HTML page generator

## Install

```
$ npm install --save-dev gulp-zetzer
```


## Usage

```js
var gulp = require('gulp');
var zetzer = require('gulp-zetzer');

gulp.task('zetzer', function(){
   gulp.src('./src/*.html', {base: './'})
       .pipe(zetzer())
       .pipe(gulp.dest('./build'));
});
```

More advanced options
```js
gulp.task('zetzer', function(){
   gulp.src('./src/*.html', {base: './'})
       .pipe(zetzer({
		   partials: './src/partials',
		   templates: './src/layouts',
		   dot_template_settings: {
			   strip: false
		   },
		   env: {
			   env_string: 'Some plain string to use with it.document.env_string'
		   }
       }))
       .pipe(gulp.dest('./build'));
});
```

All possible options are listed in the main [Zetzer][zetzer] project.

New features should be implemented in [Zetzer][zetzer]. This is just a Gulp "front-end".
[Zetzer][zetzer]: https://github.com/brainshave/zetzer


## License
* Author: Jan Rembold
* License: MIT
