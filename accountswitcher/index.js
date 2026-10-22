var patches = [];
var MultiAccountStore = null;
var previousNotificationDescriptor = null;
var changedNotificationProperty = false;

function onLoad() {
    try {
        var metro = window.vendetta && window.vendetta.metro;
        var patcher = window.vendetta && window.vendetta.patcher;
        if (!metro || !patcher) return;

        var AccountDispatcher = metro.findByProps("getCanUseMultiAccountMobile");
        MultiAccountStore = metro.findByStoreName("MultiAccountStore");

        if (AccountDispatcher && typeof AccountDispatcher.getCanUseMultiAccountMobile === "function") {
            patches.push(
                patcher.after("getCanUseMultiAccountMobile", AccountDispatcher, function () {
                    return true;
                })
            );
        }

        if (MultiAccountStore) {
            previousNotificationDescriptor = Object.getOwnPropertyDescriptor(
                MultiAccountStore,
                "canUseMultiAccountNotifications"
            );
            Object.defineProperty(MultiAccountStore, "canUseMultiAccountNotifications", {
                get: function () { return true; },
                configurable: true
            });
            changedNotificationProperty = true;
        }
    } catch (e) {
        console.error("[AccountSwitcher] Erro:", e);
    }
}

function onUnload() {
    for (var i = patches.length - 1; i >= 0; i--) {
        try { if (typeof patches[i] === "function") patches[i](); } catch (e) {}
    }
    patches.length = 0;

    if (MultiAccountStore && changedNotificationProperty) {
        try {
            if (previousNotificationDescriptor) {
                Object.defineProperty(MultiAccountStore, "canUseMultiAccountNotifications", previousNotificationDescriptor);
            } else {
                delete MultiAccountStore.canUseMultiAccountNotifications;
            }
        } catch (e) {}
    }
}

export default {
    onLoad: onLoad,
    onUnload: onUnload
};
