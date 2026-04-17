import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mtgsoftworks.fetvabulapp',
  appName: 'FetvaBul',
  webDir: '.next',
  server: {
    androidScheme: 'https',
    url: 'https://fetvabul.netlify.app',
    cleartext: false
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash_screen",
      showSpinner: false
    }
  }
};

export default config;
