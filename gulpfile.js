var gulp = require('gulp');
var sass = require('gulp-sass');
var clean = require('gulp-clean');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var webserver = require("gulp-webserver");
var imagemin = require('gulp-imagemin');
var babel = require("gulp-babel");
var buffer = require('gulp-buffer');
var tap = require('gulp-tap');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var { spawn } = require('child_process');
var runSequence = require('run-sequence');
var yaml = require('yamljs');

jekyllConfig = yaml.load('./_config.yml');

const siteDest = jekyllConfig.destination;
const siteSrc = jekyllConfig.source;

paths = {
  'scss': {
    src: 'styles/pages/*',
  },
  'css': {
    dest: siteDest + '/css',
  },
  'js': {
    src: ['scripts/**/*.js', '!scripts/_**/*.js'],
    dest: siteDest + '/js',
  },
  'img': {
    src: 'img/**/*',
    dest: siteDest + '/img',
  },
  'jekyll': {
    src: siteSrc + '/**/*',
  }
}


gulp.task('compile-scss', function() {
  gulp.src(paths.css.dest, {read: false})
    .pipe(clean());

  return gulp.src(paths.scss.src)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    // .pipe(minifyCss())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css.dest));
})


gulp.task('compile-js', function() {
  gulp.src(paths.js.dest, {read: false})
    .pipe(clean());

  return gulp.src(paths.js.src, {read: false})
    .pipe(tap(function(file) {
      console.log(`bundling ${file.path}`)
      file.contents = browserify(file.path, {debug: true}).bundle();
    }))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel())
    .pipe(uglify().on('error', function(e) {
      console.log(e);
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.js.dest));
})


gulp.task('compress-images', function() {
  gulp.src(paths.img.dest, {read: false})
    .pipe(clean());

  return gulp.src(paths.img.src)
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
    ]))
    .pipe(gulp.dest(paths.img.dest));
})


gulp.task('jekyll', function(callback) {
  let options = ['build', '--incremental']

  const jekyll = spawn('jekyll', options, {
    // stdio: 'inherit',
  });

  const jekyllLogger = function(buffer) {
    buffer.toString()
      .split(/\n/)
      .forEach(function(msg) {
        console.log(`jekyll: ${msg}`);
      })
  }

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);

  jekyll.on('exit', function(code) {
    callback()
  })
})


gulp.task('watch', function() {
  gulp.watch(paths.scss.src, ['compile-scss'])
  gulp.watch(paths.js.src, ['compile-js'])
  gulp.watch(paths.img.src, ['compress-images'])
  gulp.watch(paths.jekyll.src, ['build'])
})

gulp.task('serve', function() {
  gulp.src(siteDest)
    .pipe(webserver({
      // livereload: true,
      directoryListing: false,
      port: 8080,
    }))
})

gulp.task('build:assets', ['compile-scss', 'compile-js', 'compress-images'])

gulp.task('build', function() {
  runSequence('jekyll', 'build:assets')
})

gulp.task('develop', ['build', 'serve', 'watch'])

gulp.task('default', ['develop'])
