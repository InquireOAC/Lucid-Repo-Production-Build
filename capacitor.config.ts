
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dreamweaver.LucidRepo',
  appName: 'Lucid Repo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PurchasesCapacitor: {
      apiKey: 'appl_QNsyVEgaltTbxopyYGyhXeGOUQk'
    },
    App: {
      launchUrl: 'https://lucidrepo.app'
    }
  },
  // Deep linking configuration
  deepLinks: [
    {
      name: 'Dream Link',
      url: 'https://lucidrepo.app',
      paths: ['/dream/*']
    }
  ]
};

export default config;
