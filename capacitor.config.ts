
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dreamweaver.journal',
  appName: 'Lucid Repo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'app.dreamweaver.journal',
    backgroundColor: '#1E1A2B',
    preferredContentMode: 'mobile'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1E1A2B',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      spinnerColor: '#9F8FD9',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1E1A2B',
      overlay: false // Set to false to make the status bar opaque
    }
  }
};

export default config;
