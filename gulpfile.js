var gulp = require('gulp');
var concat = require('gulp-concat');
 
gulp.task('styles', function() {
  return gulp.src('./client/**/*.css')
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('html', function() {
  return gulp.src('./client/index.html')
  	.pipe(gulp.dest('./public'));
});

gulp.task('default', ['styles', 'html']);
