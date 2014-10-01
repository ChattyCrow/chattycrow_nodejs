var gulp    = require('gulp');
var coffee  = require('gulp-coffee');
var plumber = require('gulp-plumber');
var gutil   = require('gulp-util');

gulp.task('coffee', function() {
  return gulp.src('src/**/*.coffee')
      .pipe(plumber())
      .pipe(coffee({ bare: true }))
      .on('error', gutil.log)
      .pipe(gulp.dest('./lib/'));
});

gulp.task('watch', function() {
  return gulp.watch('src/**/*.coffee', ['coffee']);
  return gulp.watch('./lib/*.js', ['lint']);
});

gulp.task('default', [ 'coffee', 'watch' ]);
