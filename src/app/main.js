
'use strict';

// if (typeof Kindle !== 'undefined') {
//     Kindle.use(function (b) {
//         var logger = b.logging.createEventLogger('RYAN');
//         logger.warn("HEY I AM IN HERE");
//         var contentWindow;
//         var onLoad = function() {
//             contentWindow = b.contentWindow.get();
//             logger.warn("inside a function");
//         }
//         b.applicationManager.addEventListener('load', doStuffOnLoad);
//         b.applicationManager.addEventListener('load', onLoad);
//         b.applicationManager.addEventListener('go', doStuffOnLoad);
//         b.applicationManager.addEventListener('go', onLoad);
//     })
// }

import $ from "jquery";
import 'core-js/features/map';
import 'core-js/features/object';
import { logging } from "./logging";
import KindleApp, { ConnectionType, PromptLevel, ConnectionResult } from "./kindle";

const activeButtonClass = 'pure-button-active';
const activeMenuClass = 'pure-menu-selected';
const tasksKey = 'tasks';
const logKey = 'log';

class LogItem {
    constructor({ timestamp, task }) {

        if (!timestamp) {
            timestamp = Date.now();
        }
        new Date(timestamp);
        this.timestamp = timestamp;
        this.task = task;
    }

    getTimestampString() {
        return new Date(this.timestamp).toTimeString();
    }
}

const app = {
    kindle: KindleApp(),
    menuElts: new Map(),
    buttons: new Map(),
    logData: new Array(),

    setStatus: function (status) {
        $('#status').text(status);
        logging.info(`Setting status field to "${status}"`);
    },

    clearStatus: function () {
        $('#status').text('');
        logging.info('Clearing status field');
    },
    setActive: function (taskName) {
        for (const button of this.buttons.values()) {
            $(button).removeClass(activeButtonClass);
        }
        for (const elt of this.menuElts.values()) {
            $(elt).removeClass(activeMenuClass);
        }
        if (this.buttons.has(taskName)) {
            $(this.buttons.get(taskName)).addClass(activeButtonClass);
        }
        if (this.menuElts.has(taskName)) {
            $(this.menuElts.get(taskName)).addClass(activeMenuClass);
        }
        this.appendToLog(new LogItem({ task: taskName, timestamp: null }));
        this.setStatus('submitting...')
        $.post('http://192.168.1.150:1880/office/tasks/active', { active: taskName }, () => {
            app.clearStatus();
        })

    },
    populateData: function (data) {
        const dataMap = new Map(Object.entries(data))
        const rawItems = dataMap.get('tasks');

        const activeTask = dataMap.has('active') ? dataMap.get('active') : '';

        this.menuElts.clear();
        this.buttons.clear();
        const list = $("<ul/>", {
            "class": "pure-menu-list"
        });
        for (const val of rawItems) {
            if (val == 'stop') {
                // We pull this out separately
                const button = $('#stopTask');
                this.buttons.set(val, button);
            } else {
                const elt = $("<li/>", {
                    class: "pure-menu-link",
                });
                this.menuElts.set(val, elt);
                const button = $('<button/>', {
                    class: 'pure-button',
                    text: val,
                    click: () => { app.setActive(val) },
                });
                this.buttons.set(val, button);
                if (val == activeTask) {
                    elt.addClass(activeMenuClass);
                    button.addClass(activeButtonClass);
                }
                elt.append(button);
                list.append(elt);
            }
        }
        $('#stuff').html(list);
    },

    fetch: function () {
        this.setStatus('fetching...')
        const doFetch = () => {
            $.getJSON('http://192.168.1.150:1880/office/tasks', (data) => {
                app.populateData(data);
                app.clearStatus();
                data.active = '';
                logging.info(`Storing tasks: ${JSON.stringify(data)}`);
                localStorage.setItem(tasksKey, JSON.stringify(data));
            })
        };
        if (this.kindle.net.getActiveInterface() == ConnectionType.wifi) {
            doFetch();
        } else {
            this.kindle.net.ensureWifiConnection(PromptLevel.all, (result) => {
                if (result == ConnectionResult.success) {
                    doFetch();
                } else {
                    app.setStatus('could not connect to wifi to fetch...');
                }
            })
        }
    },

    appendToLog: function (logItem) {
        const elt = $("<li/>");
        elt.append($("<b/>", { text: `${logItem.getTimestampString()}:` }));
        elt.append(` ${logItem.task}`);
        $("#log").append(elt);
        this.logData.push(logItem);
        this.storeLog();
    },

    populateLog: function (logData) {
        for (const val of logData) {
            try {
                const item = new LogItem({ timestamp: val.timestamp, task: val.task });
                this.appendToLog(item);
            } catch (e) {
                logging.warn(`Could not parse log item ${val}`);
            }
        }
        this.storeLog();
    },

    storeLog: function () {
        logging.info(`Storing logged events: ${this.logData}`);
        localStorage.setItem(logKey, JSON.stringify(this.logData));
    }

}

$('#refreshtasks').on('click', function () { app.fetch() });
$('#stopTask').on('click', function () { app.setActive('stop') });
(() => {
    const storedTasks = localStorage.getItem(tasksKey);
    if (storedTasks !== null) {
        const taskData = JSON.parse(storedTasks);
        taskData.active = '';
        app.populateData(taskData);

        const storedLog = localStorage.getItem(logKey);
        if (storedLog !== null) {
            app.populateLog(JSON.parse(storedLog));
        }
    }
    app.fetch();
})();

window.app = app;
