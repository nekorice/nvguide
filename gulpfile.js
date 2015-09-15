var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    clean = require('gulp-clean'),
    notify = require('gulp-notify'),
    minifycss = require('gulp-minify-css');
    

gulp.task('styles', function(){
    return gulp.src('src/*.css')
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('dist/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/'))
        .pipe(notify({ message: 'Styles task complete' }));
        
})  

gulp.task('scripts', function() {  
  return gulp.src('src/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify({
        compress: {
         drop_console: true
        }
     }))
    .pipe(gulp.dest('dist/'))
    .pipe(notify({ message: 'Scripts task complete' }));
});  

gulp.task('clean', function() {  
  return gulp.src(['dist/'], {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function() {  
    gulp.start('styles', 'scripts');
});