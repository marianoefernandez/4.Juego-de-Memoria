import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'juego.memoria',
  appName: 'Juego de memoria',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }//,
  // plugins: {
  //   SplashScreen: {
  //     launchShowDuration: 2000,
  //     //launchAutoHide: true,
  //     launchFadeOutDuration: 1000,
  //     backgroundColor: "#ffffffff",
  //     //androidSplashResourceName: "splash",
  //     //androidScaleType: "CENTER_CROP",
  //     showSpinner: false,
  //     androidSpinnerStyle: "small",
  //     iosSpinnerStyle: "small",
  //     spinnerColor: "#999999",
  //     splashFullScreen: true,
  //     splashImmersive: true,
  //     //layoutName: "launch_screen",
  //     //useDialog: true,
  //   },
  // },
};

export default config;
