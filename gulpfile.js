/* eslint-disable require-jsdoc */
// Copyright 2020, 2021 Ryan Pavlik <ryan.pavlik@gmail.com>
// SPDX-License-Identifier: MIT
'use strict';
const { src, dest, series } = require("gulp");
const nunjucksRender = require('gulp-nunjucks-render');
const fs = require('fs');
const cleanDir = require('gulp-clean-dir');
const zip = require('gulp-zip');

const templatesDir = 'src/templates';
const appTemplates = `${templatesDir}/app/**/*.njk`;
const outDir = './dist';

// Nunjucks filters

const escapeSingleQuotes = (s) => {
    if (s === undefined) {
        return "undefined";
    }
    return s.replace("'", "\\'");
}
const escapeDoubleQuotes = (s) => {
    if (s === undefined) {
        return "undefined";
    }
    return s.replace('"', '\\"');
}
const escapeAllQuotes = (s) => {
    return escapeDoubleQuotes(escapeSingleQuotes(s));
}
// Function to add nunjucks filters
const addEscapeFilters = (env) => {
    env.addFilter('escapeSingleQuotes', escapeSingleQuotes);
    env.addFilter('escapeDoubleQuotes', escapeDoubleQuotes);
    env.addFilter('escapeAllQuotes', escapeAllQuotes);
}

const loadedData = JSON.parse(fs.readFileSync('./src/data.json'));

const cleanTask = (cb) => {
    cleanDir(outDir);
    cb();
}

const appTemplatesTask = () => {
    return src(appTemplates)
        // Renders template with nunjucks - no renaming
        .pipe(nunjucksRender({
            path: [templatesDir],
            ext: '',
            data: loadedData,
            manageEnv: addEscapeFilters,
            env: {
                autoescape: false,
                throwOnUndefined: true
            }
        }))
        // output files in app folder
        .pipe(dest(`${outDir}/extensions/${loadedData['shortName']}`));
}

const extensionZipTask = () => {
    return src(`${outDir}/extensions/${loadedData['shortName']}/{,**/}*`, { base: outDir })
        .pipe(zip(`kual_extension_${loadedData['shortName']}_v${loadedData['version']}.zip`))
        .pipe(dest(`${outDir}`));
}

exports.default = series(
    appTemplatesTask,

    // For a regular KUAL extension
    extensionZipTask
);
exports.clean = cleanTask;
