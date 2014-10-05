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

gulp.task('coffee-test', function() {
  return gulp.src('test/src/**/*.coffee')
      .pipe(plumber())
      .pipe(coffee({ bare: true }))
      .on('error', gutil.log)
      .pipe(gulp.dest('./test/'));
});

gulp.task('watch', function() {
         gulp.watch('src/**/*.coffee', ['coffee']);
  return gulp.watch('test/src/**/*.coffee', ['coffee-test']);
});

gulp.task('default', [ 'coffee', 'coffee-test', 'watch' ]);
