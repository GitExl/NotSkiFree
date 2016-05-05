/* global require */

'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');

gulp.task('default', function() {
  gulp.start('build');
});

gulp.task('build', function() {
  return gulp.src('src/**/*.ts')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(ts({
      //typescript: require('typescript'),
      module: 'amd',
      target: 'es5'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app'));
});

gulp.task('watch', function() {
  watch('src/**/*.ts', batch(function(events, done) {
    gulp.start('build', done);
  }));
});
