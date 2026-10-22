(() => {
    var patches = [];
    var MultiAccountStore = null;
    var previousNotificationDescriptor = null;
    var changedNotificationProperty = false;

    return {
        onLoad: function() {
            try {
                var metro = window.vendetta && window.vendetta.metro;
                var patcher = window.vendetta && window.vendetta.patcher;
                if (!metro || !patcher) return;

                var AccountDispatcher = metro.findByProps("getCanUseMultiAccountMobile");
                MultiAccountStore = metro.findByStoreName ? metro.findByStoreName("MultiAccountStore") : null;

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

                    try {
                        Object.defineProperty(MultiAccountStore, "canUseMultiAccountNotifications", {
                            get: function () { return true; },
                            configurable: true
                        });
                        changedNotificationProperty = true;
                    } catch (err) {}
                }
            } catch (e) {
                console.error("[AccountSwitcher] Erro no onLoad:", e);
            }
        },

        onUnload: function() {
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
    };
})();
