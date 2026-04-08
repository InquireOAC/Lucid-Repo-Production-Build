#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativePaywallPlugin, "NativePaywallPlugin",
    CAP_PLUGIN_METHOD(presentPaywall, CAPPluginReturnPromise);
)
