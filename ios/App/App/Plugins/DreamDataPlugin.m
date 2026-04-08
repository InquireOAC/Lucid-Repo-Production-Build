#import <Capacitor/Capacitor.h>

// Auto-registers the plugin with the Capacitor bridge
CAP_PLUGIN(DreamDataPlugin, "DreamDataPlugin",
    CAP_PLUGIN_METHOD(saveLatestDream, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(updateStreak,    CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(reloadWidgets,   CAPPluginReturnPromise);
)
