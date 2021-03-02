
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

function handleClick(val) {
    $.post('http://192.168.1.150:1880/office/tasks/active', { active: val }, () => {
        window.app.setActive(val)
    })
}

const activeButtonClass = 'pure-button-active';
const activeMenuClass = 'pure-menu-selected';
window.app = {
    menuElts: new Map(),
    buttons: new Map(),
    setActive: function (taskName) {
        for (const button of this.buttons.values()) {
            $(button).removeClass(activeButtonClass);
        }
        for (const elt of this.menuElts.values()) {
            $(elt).removeClass(activeMenuClass);
        }
        if (this.buttons.has(taskName)) {
            $(this.buttons.get(taskName)).addClass(activeButtonClass);
            $(this.menuElts.get(taskName)).addClass(activeMenuClass);
        }
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
        })
    }

}

$('#refreshtasks').on('click', function() { window.app.fetch() });

window.app.fetch();