
const { src, dest, parallel } = require("gulp");
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

exports.default = parallel(scriptTemplatesTask, appTemplatesTask);
exports.clean = cleanTask;
