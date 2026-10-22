// name: AccountSwitcher
// description: Enables account switcher because discord got rid of experiment
// author: nyxielly
// version: 1.1.0

window.rikaPlugins = window.rikaPlugins || {};
window.rikaPlugins.AccountSwitcher = {
    onLoad() {
        try {
            var metro = window.vendetta && window.vendetta.metro;
            var patcher = window.vendetta && window.vendetta.patcher;
            if (!metro || !patcher) return;

            var AccountDispatcher = metro.findByProps("getCanUseMultiAccountMobile");
            var MultiAccountStore = metro.findByStoreName("MultiAccountStore");

            if (AccountDispatcher && typeof AccountDispatcher.getCanUseMultiAccountMobile === "function") {
                this.unpatch = patcher.after("getCanUseMultiAccountMobile", AccountDispatcher, function () {
                    return true;
                });
            }

            if (MultiAccountStore) {
                this.oldDescriptor = Object.getOwnPropertyDescriptor(MultiAccountStore, "canUseMultiAccountNotifications");
                Object.defineProperty(MultiAccountStore, "canUseMultiAccountNotifications", {
                    get: function () { return true; },
                    configurable: true
                });
            }
        } catch (e) {
            console.error("[AccountSwitcher] Erro:", e);
        }
    },
    onUnload() {
        if (this.unpatch) this.unpatch();
        try {
            var MultiAccountStore = window.vendetta && window.vendetta.metro && window.vendetta.metro.findByStoreName("MultiAccountStore");
            if (MultiAccountStore) {
                if (this.oldDescriptor) {
                    Object.defineProperty(MultiAccountStore, "canUseMultiAccountNotifications", this.oldDescriptor);
                } else {
                    delete MultiAccountStore.canUseMultiAccountNotifications;
                }
            }
        } catch (e) {}
    }
};
