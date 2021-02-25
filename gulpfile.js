/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable require-jsdoc */
// Copyright 2020, 2021 Ryan Pavlik <ryan.pavlik@gmail.com>
// SPDX-License-Identifier: MIT
'use strict';
const { src, dest, parallel, series } = require("gulp");
const nunjucksRender = require('gulp-nunjucks-render');
const rename = require("gulp-rename"); var fs = require('fs');
const cleanDir = require('gulp-clean-dir');
const zip = require('gulp-zip');

const templatesDir = 'src/templates';
const scriptTemplates = `${templatesDir}/{Install,Uninstall}/*.njk`;
const appTemplates = `${templatesDir}/app/**/*.njk`;
const outDir = './dist';

function getData() {
    return JSON.parse(fs.readFileSync('./src/data.json'));
}

const loadedData = getData();

function cleanTask(cb) {
    cleanDir(outDir);
    cb();
}

const scriptTemplatesTask = () => {
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
        .pipe(dest(outDir));
}

const appTemplatesTask = () => {
    return src(appTemplates)
        // Renders template with nunjucks - no renaming
        .pipe(nunjucksRender({
            path: [templatesDir],
            ext: '',
            data: loadedData
        }))
        // output files in app folder
        .pipe(dest(`${outDir}/${loadedData['shortName']}`));
}

const appZipTask = () => {
    return src(`${outDir}/${loadedData['shortName']}`)
        .pipe(zip(`${loadedData['shortName']}.zip`))
        .pipe(dest(`${outDir}/Install`));
}

const { spawn } = require('child_process');

const runKindleTool = (cwd, args, cb) => {

    const kindletool = spawn('../../kindletool/kindletool',
        args,
        {
            cwd: cwd,
            stdio: ['ignore', 'inherit', 'inherit']
        });
    kindletool.on('close', (code) => {
        console.log(`kindletool exited with code ${code}`);
        cb();
    });
}

// https://storage.sbg.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/KindleTool/kindletool-v1.6.5.230-linux-x86_64.tar.gz
const kindleToolInstall = (cb) => {
    const shortName = loadedData['shortName'];
    const version = loadedData['version'];
    runKindleTool(process.cwd() + '/dist/Install',
        [
            'create',
            'ota2',
            '-d', 'kindle5',
            `${shortName}_install.ffs`,
            `${shortName}.zip`,
            `${shortName}_event_handler.conf`,
            `update_${shortName}_v${version}_install.bin`
        ], cb);
}


const kindleToolUninstall = (cb) => {
    const shortName = loadedData['shortName'];
    const version = loadedData['version'];
    runKindleTool(process.cwd() + '/dist/Uninstall',
        [
            'create',
            'ota2',
            '-d', 'kindle5',
            `${shortName}_uninstall.ffs`,
            `update_${shortName}_v${version}_uninstall.bin`
        ], cb);
}
exports.default = series(parallel(scriptTemplatesTask, appTemplatesTask), appZipTask, kindleToolUninstall, kindleToolInstall);
exports.clean = cleanTask;
