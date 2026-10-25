import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a632826ed5324e0f8900f038b0b23fbf',
  appName: 'hello-world-project-69109',
  webDir: 'dist',
  // Comment out or remove server config for production APK builds
  // server: {
  //   url: 'https://a632826e-d532-4e0f-8900-f038b0b23fbf.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'light',
      overlaysWebView: true
    }
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#ffffff'
  },
  ios: {
    contentInset: 'always'
  },
  preferences: {
    Orientation: 'portrait'
  }
};

export default config;
