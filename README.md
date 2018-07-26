# Jekyll + Netlify Framework
This defines a code configuration to use when building static sites with Jekyll, and deploying with Netlify.

## Details
- You write SCSS, HTML, Javascript
- Barebones, themeless Jekyll
- Uses gulp.js to build and serve the site
- Netlify Functions capability included
- Javascript bundled with browserify, transpiled with Babel
- Custom SCSS and ES linting

## Getting Started
To start developing:
```
npm install
gulp develop
```

To build the site for deployment (e.g. on Netlify):
```
gulp build
```

Site builds to `_site` folder.

## Configuration Files
- `_config.yml`: Jekyll config
- `netlify.toml`: Netlify config
- `gulpfile.js`: Gulp build and serve setup
- `babelrc`: Babel config
- `eslintrc`: ES lint config
- `.scss-lint.yml`: SCSS lint config
- `package.json`: Node packages config

## Notes To Self
- Setup for Airbnb eslint config was not trivial IIRC
-
