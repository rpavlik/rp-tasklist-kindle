/* eslint-disable require-jsdoc */
// Copyright 2020, 2021 Ryan Pavlik <ryan.pavlik@gmail.com>
// SPDX-License-Identifier: MIT
'use strict';
const { src, dest, series, task } = require("gulp");
const { makeAppTemplateTask, makeExtensionZipTask } = require('./kual-ext')
const fs = require('fs');
const cleanDir = require('gulp-clean-dir');
const zip = require('gulp-zip');

const templatesDir = 'src/templates';
const appTemplates = `${templatesDir}/app/**/*.njk`;
const outDir = './dist';

const loadedData = JSON.parse(fs.readFileSync('./src/data.json'));

const cleanTask = (cb) => {
    cleanDir(outDir);
    cb();
}

const appTemplatesTask = task("appTemplates", makeAppTemplateTask({
    appTemplates,
    templatesDir,
    loadedData,
    outDir
}));
const extensionZipTask = task("extensionZip", makeExtensionZipTask({
    shortName: loadedData['shortName'],
    version: loadedData['version'],
    outDir: outDir
}));

const extensionZipTask = () => {
    return src(`${outDir}/extensions/${loadedData['shortName']}/{,**/}*`, { base: outDir })
        .pipe(zip(`kual_extension_${loadedData['shortName']}_v${loadedData['version']}.zip`))
        .pipe(dest(`${outDir}`));
}

exports.default = series(
    // appTemplatesTask,
    "appTemplates",

    // For a regular KUAL extension
    // extensionZipTask
    "extensionZip"
);
exports.clean = cleanTask;
