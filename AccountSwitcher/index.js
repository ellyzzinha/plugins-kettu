var findByProps = window.vendetta && window.vendetta.metro && window.vendetta.metro.findByProps;
var findByStoreName = window.vendetta && window.vendetta.metro && window.vendetta.metro.findByStoreName;
var after = window.vendetta && window.vendetta.patcher && window.vendetta.patcher.after;

var patches = [];
var MultiAccountStore = null;
var previousNotificationDescriptor = null;
var changedNotificationProperty = false;

function onLoad() {
    if (!findByProps || !findByStoreName || !after) {
        console.error("[AccountSwitcher] Required Kettu/Vendetta APIs were not found.");
        return;
    }

    var AccountDispatcher = findByProps("getCanUseMultiAccountMobile");
    MultiAccountStore = findByStoreName("MultiAccountStore");

    if (AccountDispatcher && typeof AccountDispatcher.getCanUseMultiAccountMobile === "function") {
        patches.push(
            after("getCanUseMultiAccountMobile", AccountDispatcher, function (_args, _result) {
                return true;
            })
        );
    } else {
        console.warn("[AccountSwitcher] getCanUseMultiAccountMobile was not found.");
    }

    if (MultiAccountStore) {
        previousNotificationDescriptor = Object.getOwnPropertyDescriptor(
            MultiAccountStore,
            "canUseMultiAccountNotifications"
        );

        try {
            Object.defineProperty(MultiAccountStore, "canUseMultiAccountNotifications", {
                get: function () { return true; },
                configurable: true
            });
            changedNotificationProperty = true;
        } catch (error) {
            console.error("[AccountSwitcher] Could not override notification support:", error);
        }
    } else {
        console.warn("[AccountSwitcher] MultiAccountStore was not found.");
    }
}

function onUnload() {
    for (var i = patches.length - 1; i >= 0; i--) {
        try {
            if (typeof patches[i] === "function") patches[i]();
        } catch (error) {
            console.warn("[AccountSwitcher] Failed to remove patch:", error);
        }
    }
    patches.length = 0;

    if (MultiAccountStore && changedNotificationProperty) {
        try {
            if (previousNotificationDescriptor) {
                Object.defineProperty(
                    MultiAccountStore,
                    "canUseMultiAccountNotifications",
                    previousNotificationDescriptor
                );
            } else {
                delete MultiAccountStore.canUseMultiAccountNotifications;
            }
        } catch (error) {
            console.warn("[AccountSwitcher] Failed to restore notification property:", error);
        }
    }

    MultiAccountStore = null;
    previousNotificationDescriptor = null;
    changedNotificationProperty = false;
}

module.exports = {
    onLoad: onLoad,
    onUnload: onUnload
};
