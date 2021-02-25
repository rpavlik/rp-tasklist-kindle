/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable require-jsdoc */
// Copyright 2020, 2021 Ryan Pavlik <ryan.pavlik@gmail.com>
// SPDX-License-Identifier: MIT
'use strict';
const { src, dest, parallel, task } = require("gulp");
const nunjucksRender = require('gulp-nunjucks-render');
const rename = require("gulp-rename");var fs = require('fs');
const cleanDir = require('gulp-clean-dir');
const zip = require('gulp-zip');


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

function scriptTemplatesTask() {
    return src(scriptTemplates)
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
}

function appTemplatesTask() {
    return src(appTemplates)
        // Renders template with nunjucks - no renaming
        .pipe(nunjucksRender({
            path: [templatesDir],
            ext: '',
            data: loadedData
        }))
        // output files in app folder
        .pipe(dest(outDir))
}


const tap = require('gulp-tap');
const sass = require('gulp-sass');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const tsify = require('tsify');
const commonShake = require('common-shakeify');
const packFlat = require('browser-pack-flat');

task('css-compile', (done) => {
    src('./src/app/scss/*.scss')
    .pipe(sass({outputStyle: 'nested'}).on('error', sass.logError))
    .pipe(autoprefixer())
    // .pipe(rename({ dirname: cssAddonsPath }))
    .pipe(gulp.dest('./dist/css'));

    done();
})

exports.default = parallel(scriptTemplatesTask, appTemplatesTask, 'css-compile');
exports.clean = cleanTask;
