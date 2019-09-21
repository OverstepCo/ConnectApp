cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-statusbar.statusbar",
      "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
      "pluginId": "cordova-plugin-statusbar",
      "clobbers": [
        "window.StatusBar"
      ]
    },
    {
      "id": "cordova-plugin-admobpro-firebase.AdMob",
      "file": "plugins/cordova-plugin-admobpro-firebase/www/AdMob.js",
      "pluginId": "cordova-plugin-admobpro-firebase",
      "clobbers": [
        "window.AdMob"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-statusbar": "2.4.2",
    "cordova-plugin-extension": "1.5.4",
    "cordova-admobsdk": "7.49.0",
    "cordova-plugin-admobpro-firebase": "2.49.0"
  };
});