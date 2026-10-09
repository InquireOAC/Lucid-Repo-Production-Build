#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativeOnboardingPlugin, "NativeOnboardingPlugin",
    CAP_PLUGIN_METHOD(presentOnboarding, CAPPluginReturnPromise);
)
