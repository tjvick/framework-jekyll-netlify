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
var responsive = require('gulp-responsive');
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
gulp.task('clean-css', function() {
  return gulp.src(paths.css.dest, {read: false})
    .pipe(clean());
})

gulp.task('compile-scss', function() {
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

gulp.task('build:css', function() {
  return runSequence('clean-css', 'compile-scss');
})

// JAVASCRIPT tasks
gulp.task('clean-js', function() {
  return gulp.src(paths.js.dest, {read: false})
    .pipe(clean());
})

gulp.task('move-js', function() {
  // for javascript that doesn't get compiled
  return gulp.src(paths.jsdir.src)
    .pipe(gulp.dest(paths.jsdir.dest))
})

gulp.task('compile-js', function() {
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

gulp.task('build:js', function() {
  runSequence('clean-js', ['move-js', 'compile-js']);
})


// MEDIA tasks
gulp.task('clean-media', function() {
  return gulp.src(paths.media.dest, {read: false})
    .pipe(clean());
})

gulp.task('compress-images', function() {
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
})

gulp.task('move-media', function() {
  gulp.src(paths.mediadir.dest, {read: false})
    .pipe(clean());

  return gulp.src(paths.mediadir.src)
    .pipe(gulp.dest(paths.mediadir.dest));
})

gulp.task('build:media', function() {
  runSequence('clean-media', ['compress-images', 'move-media']);
})


// JEKYLL tasks
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


// NETLIFY LAMBDA tasks
gulp.task('build:netlify', function(callback) {
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
})

gulp.task('serve:netlify', function(callback) {
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
})


// SERVE tasks
gulp.task('serve:site', function() {
  return gulp.src(siteDest)
    .pipe(webserver({
      // livereload: true,
      directoryListing: false,
      port: 8080,
    }))
})

gulp.task('serve', ['serve:site', 'serve:netlify']);


// WATCH tasks
gulp.task('watch', function() {
  gulp.watch(paths.scss.src, ['compile-scss'])
  gulp.watch(paths.js.src, ['compile-js'])
  gulp.watch(paths.jsdir.src, ['move-js'])
  gulp.watch(paths.media.src, ['compress-images'])
  gulp.watch(paths.mediadir.src, ['move-media'])
  gulp.watch(paths.jekyll.src, ['build'])
  gulp.watch(paths.lambda.watch, ['build:netlify'])
  return gulp.watch(paths.jekyll.src, ['build'])
})

// build assets
gulp.task('build:prod:assets', ['build:css', 'build:js', 'build:media', 'build:netlify']);
gulp.task('build:dev:assets', ['build:css', 'build:js', 'build:media'])

// develop build
gulp.task('build:dev', function() {
  return runSequence('jekyll', 'build:dev:assets')
})

// production build
gulp.task('build', function() {
  return runSequence('jekyll', 'build:prod:assets')
})

// develop
gulp.task('develop', ['build:dev', 'serve', 'watch'])

gulp.task('default', ['develop'])

