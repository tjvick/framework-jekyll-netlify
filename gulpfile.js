var gulp = require('gulp');
var sass = require('gulp-sass');
var del = require('del');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var connect = require("gulp-connect");
var babel = require("gulp-babel");
var buffer = require('gulp-buffer');
var responsive = require('gulp-responsive');
var tap = require('gulp-tap');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var { spawn } = require('child_process');
var yaml = require('yamljs');


var jekyllConfig = yaml.load('./_config.yml');

var siteDest = jekyllConfig.destination;
var siteSrc = jekyllConfig.source;

var paths = {
  'scss': {
    src: 'styles/pages/*',
    watch: 'styles/**/*',
  },
  'css': {
    dest: siteDest + '/css',
  },
  'js': {
    src: ['scripts/**/*.js', '!scripts/_**/*.js'],
    dest: siteDest + '/js',
  },
  'jsdir': {
    src: 'scripts/_direct/*.js',
    dest: siteDest + '/js',
  },
  'media': {
    src: ['media/**/*', '!media/_direct/*'],
    dest: siteDest + '/media',
  },
  'mediadir': {
    src: 'media/_direct/*',
    dest: siteDest + '/media',
  },
  'jekyll': {
    src: siteSrc + '/**/*',
  },
  'lambda': {
    src: 'scripts/_lambda',
    watch: 'scripts/_lambda/**/*.js',
  }
}

// CSS tasks
function cleanCSS() {
  return del(paths.css.dest);
}

function compileSCSS() {
  return gulp.src(paths.scss.src)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    // .pipe(minifyCss())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css.dest));
}

var buildCSS = gulp.series(cleanCSS, compileSCSS);

// JAVASCRIPT tasks
function cleanJS() {
  return del(paths.js.dest);
}

function moveJS() {
  // for javascript that doesn't get compiled
  return gulp.src(paths.jsdir.src)
    .pipe(gulp.dest(paths.jsdir.dest))
}

function compileJS() {
  return gulp.src(paths.js.src, {read: false})
    .pipe(tap(function(file) {
      console.log(`bundling ${file.path}`)
      file.contents = browserify(file.path, {debug: true}).bundle();
    }))
    .pipe(buffer())
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel())
    // .pipe(uglify().on('error', function(e) {
    //   console.log(e);
    // }))
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.js.dest));
}

var buildJS = gulp.series(cleanJS, gulp.parallel(moveJS, compileJS));


// MEDIA tasks
function cleanMedia() {
  return del(paths.media.dest);
}

function compressImages() {
  return gulp.src(paths.media.src)
    .pipe(responsive({
      '**/*.jpg': [
        // shrink files that are large
        {
          width: 2000,
          withoutEnlargement: true,
          rename: {
            suffix: '-2000px'
          }
        },
        // apply default compression without rename
        {
          progressive: true,
        },
      ],
      '**/*.png': {
        // need this configuration to catch png files
        // apply default compression without rename
        progressive: false,
      },
    }, {
      passThroughUnused: true,
      errorOnUnusedImage: false,
      errorOnUnusedConfig: false,
      errorOnEnlargement: true,
      stats: true,
      silent: true,
      // default compression settings
      quality: 75,
      progressive: true,
      compressionLevel: 6,
      adaptiveFiltering: true,
    }))
    .pipe(gulp.dest(paths.media.dest));
}

function cleanMediaDir() {
  return del(paths.mediadir.dest);
}

function moveMedia() {
  return gulp.src(paths.mediadir.src)
    .pipe(gulp.dest(paths.mediadir.dest));
}

var buildMedia =  gulp.series(gulp.parallel(cleanMedia, cleanMediaDir), gulp.parallel(compressImages, moveMedia));

// JEKYLL tasks
function runJekyll(callback) {
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
}


// NETLIFY LAMBDA tasks
function buildNetlify(callback) {
  let options = ['build', paths.lambda.src];

  const netlify = spawn('netlify-lambda', options)

  const netlifyLogger = function(buffer) {
    buffer.toString()
      .split(/\n/)
      .forEach(function(msg) {
        console.log(`netlify-lambda: ${msg}`);
      })
  }

  netlify.stdout.on('data', netlifyLogger);
  netlify.stderr.on('data', netlifyLogger);

  netlify.on('exit', function() {
    callback();
  })
}

function serveNetlify(callback) {
  let options = ['serve', paths.lambda.src];

  const netlify = spawn('netlify-lambda', options)

  const netlifyLogger = function(buffer) {
    buffer.toString()
      .split(/\n/)
      .forEach(function(msg) {
        console.log(`netlify-lambda: ${msg}`);
      })
  }

  netlify.stdout.on('data', netlifyLogger);
  netlify.stderr.on('data', netlifyLogger);

  netlify.on('exit', function() {
    callback();
  })
}

function serveSite() {
  connect.server({
    root: siteDest,
    livereload: false,
    port: 8080,
  })
}

var serve = gulp.parallel(serveSite, serveNetlify);

// build assets
var buildAssetsDev = gulp.parallel(buildCSS, buildJS, buildMedia);
var buildAssetsProd = gulp.parallel(buildCSS, buildJS, buildMedia, buildNetlify);

// build site
var buildDev = gulp.series(runJekyll, buildAssetsDev);
var buildProd = gulp.series(runJekyll, buildAssetsProd);

// watch
function watch() {
  gulp.watch(paths.scss.watch, compileSCSS);
  gulp.watch(paths.js.src, compileJS);
  gulp.watch(paths.jsdir.src, moveJS);
  gulp.watch(paths.media.src, compressImages);
  gulp.watch(paths.mediadir.src, moveMedia);
  gulp.watch(paths.lambda.watch, buildNetlify);
  gulp.watch(paths.jekyll.src, buildDev);
}

// exposed tasks
var develop = gulp.parallel(buildDev, serve, watch);
gulp.task('build', buildProd);
gulp.task('develop', develop);
gulp.task('default', develop);

gulp.task('buildNetlify', buildNetlify)
