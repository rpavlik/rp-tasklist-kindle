
export const PromptLevel = {
    all: 'all',
    never: 'never',
    noCaptive: 'nocaptive',
};

export const ConnectionType = {
    none: 'none',
    wifi: 'wifi',
    wan: 'wan',
};

export const ConnectionResult = {
    success: 'success',
    // etc - not using other yet
};
// Wrap the kindle.stuff objects so that there's a desktop alternative.
export default function KindleApp() {
    const haveKindle = (typeof kindle != 'undefined');
    return {
        messaging: {
            sendMessage: function (target, propName, propVal) {
                if (haveKindle) {
                    kindle.messaging.sendMessage(target, propName, propVal);
                } else {
                    console.log(`sendMessage(${target}, ${propName}, ${propVal})`);
                }
            },
            receiveMessage: function (event, handler) {
                if (haveKindle) {
                    kindle.messaging.receiveMessage(event, handler);
                } else {
                    console.log(`receiveMessage(${event}, ${handler})`);
                }
            }
        },
        appmgr: {
            setOnpause: function (handler) {
                if (haveKindle) {
                    kindle.appmgr.onpause = handler;
                } else {
                    console.log(`setOnpause( ${handler})`);
                }
            }
        },
        net: {
            ensureWifiConnection: function (promptLevel, handler) {
                if (haveKindle) {
                    kindle.net.ensureWifiConnection(promptLevel, handler);
                } else {
                    console.log(`ensureWifiConnection(${promptLevel}, ${handler})`);
                    handler('success');
                }
            },
            getActiveInterface: function () {
                if (haveKindle) {
                    return kindle.net.getActiveInterface();
                } else {
                    return 'wifi';
                }
            }
        }
    };
}

