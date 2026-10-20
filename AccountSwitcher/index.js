var patches = [];
var MultiAccountStore = null;
var previousNotificationDescriptor = null;
var changedNotificationProperty = false;

function onLoad() {
    try {
        var metro = (window.vendetta && window.vendetta.metro) || (window.vencord && window.vencord.metro) || window.metro;
        var patcher = (window.vendetta && window.vendetta.patcher) || (window.vencord && window.vencord.patcher) || window.patcher;

        var findByProps = metro && metro.findByProps;
        var findByStoreName = metro && metro.findByStoreName;
        var after = patcher && patcher.after;

        if (!findByProps || !after) {
            console.error("[AccountSwitcher] apis do metro/patcher nao encontradas.");
            return;
        }

        var AccountDispatcher = findByProps("getCanUseMultiAccountMobile");
        MultiAccountStore = findByStoreName ? findByStoreName("MultiAccountStore") : null;

        if (AccountDispatcher && typeof AccountDispatcher.getCanUseMultiAccountMobile === "function") {
            patches.push(
                after("getCanUseMultiAccountMobile", AccountDispatcher, function () {
                    return true;
                })
            );
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
            } catch (err) {
                console.error("[AccountSwitcher] erro ao alterar MultiAccountStore:", err);
            }
        }
    } catch (e) {
        console.error("[AccountSwitcher] erro fatal no onLoad:", e);
    }
}

function onUnload() {
    for (var i = patches.length - 1; i >= 0; i--) {
        try {
            if (typeof patches[i] === "function") patches[i]();
        } catch (e) {}
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
        } catch (e) {}
    }

    MultiAccountStore = null;
    previousNotificationDescriptor = null;
    changedNotificationProperty = false;
}

module.exports = {
    onLoad: onLoad,
    onUnload: onUnload
};
