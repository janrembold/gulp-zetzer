# gulp-zetzer

> Gulp plugin for [zetzer] - static HTML page generator

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
           quite: true,
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

All possible options are listed in the main [zetzer] project.

The only gulp-zetzer specific option is 'quite' that defaults to 'false'. 
Setting this option to 'true' removes the processed file information from the command line.  


New features should be implemented in [zetzer]. This is just a Gulp "front-end".
[zetzer]: https://github.com/brainshave/zetzer


## License
* Author: Jan Rembold
* License: MIT
