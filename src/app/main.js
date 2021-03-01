
'use strict';
// function doStuffOnLoad() {
//     if (typeof kindle !== 'undefined') {

//         $("#b").innerHTML = "this is a kindle";
//         kindle.dev.log("this is a kindle");
//     }

//     $("mine").onclick = function () {
//         $("#stuff").innerHTML = "plz wait";
//         // document.getElementById("stuff").innerHTML =
//         fetch('http://192.168.1.150:1880/office/tasks')
//             .then(function (response) {
//                 return response.json();
//             }).then(function (json) {
//                 $("#stuff").innerHTML = json;
//             });
//         return false;
//     };
// }
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

// doStuffOnLoad();
if (typeof kindle !== 'undefined') {
}

$.getJSON('http://192.168.1.150:1880/office/tasks', function (data) {
    document.getElementById("c").innerHTML = "gotcha from inside a script!";
    var items = [];
    $.each(data, function (i, val) {
        items.push(`<li>${val}</li>`)
    });

    $("<ul/>", {
        "class": "my-new-list",
        html: items.join("")
    }).appendTo("body");
})