
const { src, dest, series } = require("gulp");
const nunjucksRender = require('gulp-nunjucks-render');
const rename = require("gulp-rename");
const data = require('gulp-data'); var fs = require('fs');
const cleanDir = require('gulp-clean-dir');


const templatesDir = 'src/templates';
const templates = `${templatesDir}/*.njk`;
const outDir = './dist';

function getData() {
    return JSON.parse(fs.readFileSync('./src/data.json'));
}

function cleanTask(cb) {
    cleanDir(outDir);
    cb();
}
function templateTask() {
    const loadedData = getData();
    return src(templates)
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

exports.default = series(templateTask);
exports.clean = cleanTask;
