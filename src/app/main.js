
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

function handleClick(val) {
    window.app.setActive(val)
}

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

window.app = {
    menuElts: new Map(),
    buttons: new Map(),
    logData: new Array(),
    setActive: function (taskName) {
        if (!this.buttons.has(taskName)) {
            return;
        }
        for (const button of this.buttons.values()) {
            $(button).removeClass(activeButtonClass);
        }
        for (const elt of this.menuElts.values()) {
            $(elt).removeClass(activeMenuClass);
        }
        $(this.buttons.get(taskName)).addClass(activeButtonClass);
        $(this.menuElts.get(taskName)).addClass(activeMenuClass);
        this.appendToLog(new LogItem({ task: taskName, timestamp: null }));
        $('#submitting').show();
        $.post('http://192.168.1.150:1880/office/tasks/active', { active: taskName }, () => {
            $('#submitting').hide();
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
            const elt = $("<li/>", {
                class: "pure-menu-link",
            });
            this.menuElts.set(val, elt);
            const button = $('<button/>', {
                class: 'pure-button',
                text: val,
                click: function () { handleClick(val) },
            });
            this.buttons.set(val, button);
            if (val == activeTask) {
                elt.addClass(activeMenuClass);
                button.addClass(activeButtonClass);
            }
            elt.append(button);
            list.append(elt);
        }
        $('#stuff').html(list);
    },

    fetch: function () {
        $('#stuff').html("tasks loading, please wait");
        $.getJSON('http://192.168.1.150:1880/office/tasks', (data) => {
            window.app.populateData(data);
            data.active = '';
            logging.info(`Storing tasks: ${data}`);
            localStorage.setItem(tasksKey, JSON.stringify(data));
        })
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

$('#refreshtasks').on('click', function () { window.app.fetch() });
(() => {
    const storedTasks = localStorage.getItem(tasksKey);
    if (storedTasks !== null) {
        const taskData = JSON.parse(storedTasks);
        taskData.active = '';
        window.app.populateData(taskData);

        const storedLog = localStorage.getItem(logKey);
        if (storedLog !== null) {
            window.app.populateLog(JSON.parse(storedLog));
        }
    }
    window.app.fetch();
})();
