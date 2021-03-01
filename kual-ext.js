/* eslint-disable require-jsdoc */
// Copyright 2020, 2021 Ryan Pavlik <ryan.pavlik@gmail.com>
// SPDX-License-Identifier: MIT
'use strict';
const { src, dest } = require("gulp");
const nunjucksRender = require('gulp-nunjucks-render');
const zip = require('gulp-zip');


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


const makeAppTemplateTask = ({ appTemplates, templatesDir, loadedData, outDir }) => {
    return () => {
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
}

const makeExtensionZipTask = ({ shortName, outDir, version }) => {
    return () => {
        return src(`${outDir}/extensions/${shortName}/{,**/}*`, { base: outDir })
            .pipe(zip(`kual_extension_${shortName}_v${version}.zip`))
            .pipe(dest(`${outDir}`));
    }
}

exports.makeAppTemplateTask = makeAppTemplateTask;
exports.makeExtensionZipTask = makeExtensionZipTask;
