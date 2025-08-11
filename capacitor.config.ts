
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
    }
  }
};

export default config;
