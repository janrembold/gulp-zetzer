var gulp = require('gulp');
var zetzer = require('./../index.js');

gulp.task('default', function(){
   gulp.src('./src/*.html', {base: './'})
       .pipe(zetzer({
		   partials: './src/partials',
		   templates: './src/layouts',
		   dot_template_settings: {
			   strip: false
		   },
		   env: {
			   env_string: 'Successful Environment String Test',
			   env_function: function() {
				   return 'Successful Environment Function Test';
			   }
		   }
       }))
       .pipe(gulp.dest('./build'));
});
