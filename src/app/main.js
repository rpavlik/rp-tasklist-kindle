import 'whatwg-fetch'
import { init } from './hnl.mobileConsole.js'

import $ from "jquery";


function doStuffOnLoad() {
    if (typeof kindle !== 'undefined') {

        $("#a").innerHTML = "this is a kindle";
        kindle.dev.log("this is a kindle");
        // this is a kindle
        init();
        alert("kindle")
    } else {
        document.getElementById("a").innerHTML = "not a kindle";
        // alert("not kindle")
    }

    $("mine").onclick = function () {
        $("#stuff").innerHTML = "plz wait";
        // document.getElementById("stuff").innerHTML =
        fetch('http://192.168.1.150:1880/office/tasks')
            .then(function (response) {
                return response.json();
            }).then(function (json) {
                $("#stuff").innerHTML = json;
            });
        return false;
    };
}
if (typeof Kindle !== 'undefined') {
    Kindle.use(function (b) {
        var logger = b.logging.createEventLogger('RYAN');
        logger.warn("HEY I AM IN HERE");
        var contentWindow;
        var onLoad = function() {
            contentWindow = b.contentWindow.get();
            logger.warn("inside a function");
        }
        b.applicationManager.addEventListener('load', doStuffOnLoad);
        b.applicationManager.addEventListener('load', onLoad);
        b.applicationManager.addEventListener('go', doStuffOnLoad);
        b.applicationManager.addEventListener('go', onLoad);
    })
}
// $(function() {

// })

// window.onload = () => {
//     if (typeof kindle !== 'undefined') {

//         document.getElementById("a").innerHTML = "this is a kindle"
//         // this is a kindle
//         init();
//     } else {
//         document.getElementById("a").innerHTML = "not a kindle"
//     }

//     document.getElementById("mine").onclick = () => {
//         document.getElementById("stuff").innerHTML = "plz wait";
//         fetch('http://192.168.1.150:1880/office/tasks')
//             .then(function (response) {
//                 return response.json();
//             }).then(function (json) {
//                 document.getElementById("stuff").innerHTML = json;
//             });
//         return false;
//     };
// };