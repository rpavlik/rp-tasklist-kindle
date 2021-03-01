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

const appTemplatesTask = makeAppTemplateTask({
    appTemplates,
    templatesDir,
    loadedData,
    outDir
});
task("appTemplates", appTemplatesTask);
const extensionZipTask =  makeExtensionZipTask({
    shortName: loadedData['shortName'],
    version: loadedData['version'],
    outDir: outDir
});
task("extensionZip", extensionZipTask);

exports.default = series(
    // appTemplatesTask,
    "appTemplates",

    // For a regular KUAL extension
    // extensionZipTask
    "extensionZip"
);
exports.clean = cleanTask;
