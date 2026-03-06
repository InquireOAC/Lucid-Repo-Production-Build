
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dreamweaver.LucidRepo',
  appName: 'Lucid Repo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {},
  ios: {
    allowsLinkPreview: false,
    scrollEnabled: true,
    allowsInlineMediaPlayback: true
  }
};

export default config;
