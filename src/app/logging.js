
const isKindle = window.kindle && kindle.dev;
const doLog = isKindle ?
    (({ msg, level }) => kindle.dev.log({ event: "log", msg: msg, level: level }))
    : (({ msg, level }) => console.log(`${level}: ${msg}`))
const levels = {
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
}
export const logging = {
    debug: function (msg) { doLog({ msg: msg, level: levels.debug }); },
    info: function (msg) { doLog({ msg: msg, level: levels.info }); },
    warn: function (msg) { doLog({ msg: msg, level: levels.warn }); },
    error: function (msg) { doLog({ msg: msg, level: levels.error }); },
}