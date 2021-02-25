/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable require-jsdoc */
// Copyright 2020, 2021 Ryan Pavlik <ryan.pavlik@gmail.com>
// SPDX-License-Identifier: MIT
'use strict';
const { src, dest, parallel, series, task } = require("gulp");
const nunjucksRender = require('gulp-nunjucks-render');
const rename = require("gulp-rename"); var fs = require('fs');
const cleanDir = require('gulp-clean-dir');
// const zip = require('gulp-zip');


const templatesDir = 'src/templates';
const scriptTemplates = `${templatesDir}/{Install,Uninstall}/*.njk`;
const appTemplates = `${templatesDir}/app/{**/}*.njk`;
const outDir = './dist';

function getData() {
    return JSON.parse(fs.readFileSync('./src/data.json'));
}

const loadedData = getData();

function cleanTask(cb) {
    cleanDir(outDir);
    cb();
}

const scriptTemplatesTask = (cb) => {
    src(scriptTemplates)
        // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: [templatesDir],
            ext: '',
            data: loadedData
        }))
        // .pipe(data(loadedData))
        .pipe(rename(function (path) {
            path.basename = loadedData['shortName'] + '_' + path.basename;
        }))
        // output files in app folder
        .pipe(dest(outDir))
    cb();
}

function appTemplatesTask(cb) {
    src(appTemplates)
        // Renders template with nunjucks - no renaming
        .pipe(nunjucksRender({
            path: [templatesDir],
            ext: '',
            data: loadedData
        }))
        // output files in app folder
        .pipe(dest(outDir));

    cb();
}


// const tap = require('gulp-tap');
// const sass = require('gulp-sass');
// const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const tsify = require('tsify');
// const autoprefixer = require('gulp-autoprefixer');
// const commonShake = require('common-shakeify');
// const packFlat = require('browser-pack-flat');
const babelify = require('babelify');
// const log = require('gulplog');
const sourcemaps = require('gulp-sourcemaps');
// const uglify = require('gulp-uglify');
// const terser = require('gulp-terser');
// const postcss = require('gulp-postcss');
// const autoprefixer = require('autoprefixer');
// var source = require('vinyl-source-stream');

const css_compile = (done) => {
    // src('./src/app/scss/*.scss')
    //     .pipe(sourcemaps.init())
    //     .pipe(sass({ outputStyle: 'nested' }).on('error', sass.logError))
    //     // .pipe(postcss([autoprefixer()]))
    //     // .pipe(autoprefixer())
    //     .pipe(sourcemaps.write())
    //     // .pipe(rename({ dirname: cssAddonsPath }))
    //     .pipe(dest('./dist/bin/css'));

    done();
};
const intermediateDir = './dist/intermediate/html';
const html_compile = (done) => {
    src('./src/app/*.njk')
        .pipe(nunjucksRender({
            path: [templatesDir],
            ext: '',
            data: loadedData
        }))
        .pipe(dest('./dist/bin'));
    done();
};
const ts_compile = (done) => {
    var b = browserify({
        entries: ['src/app/main.ts']
    })
        .plugin(tsify, { target: 'es6' });
        // .transform(babelify, { extensions: ['.tsx', '.ts'] });

    b
        // .plugin(commonShake)
        // .plugin(packFlat)
        .bundle()
        // .pipe(source('main.min.ts'))
        // .pipe(buffer())

        // .pipe(uglify().on('error', log.info))
        .pipe(dest('./dist/bin'));
    done();
};

exports.default = parallel(scriptTemplatesTask, appTemplatesTask, css_compile, html_compile, ts_compile);
exports.clean = cleanTask;
