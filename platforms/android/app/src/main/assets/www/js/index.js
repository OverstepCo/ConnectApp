/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    console.log("device onDeviceReady");
    setupFBplugin();
    //this.receivedEvent('deviceready');
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};

app.initialize();


//notifications
var FirebasePlugin;

// UI logging
function log(msg, opts) {
  console.log(msg);
}

function logError(msg, error) {
  console.log(msg);

}

function clearLog() {
  console.log('clear');
}

// Init
function setupFBplugin() {
  FirebasePlugin = window.FirebasePlugin;
  log("deviceready");


  //Register handlers
  FirebasePlugin.onMessageReceived(function(message) {
    try {
      console.log("onMessageReceived");
      console.dir(message);
      if (message.messageType === "notification") {
        handleNotificationMessage(message);
      } else {
        handleDataMessage(message);
      }
    } catch (e) {
      logError("Exception in onMessageReceived callback: " + e.message);
    }

  }, function(error) {
    logError("Failed receiving FirebasePlugin message", error);
  });

  FirebasePlugin.onTokenRefresh(function(token) {
    log("Token refreshed: " + token)
  }, function(error) {
    logError("Failed to refresh token", error);
  });

  checkNotificationPermission(false); // Check permission then get token

  checkAutoInit();

  // Platform-specific
  //$$('body').addClass(cordova.platformId);
  if (cordova.platformId === "android") {
    initAndroid();
  } else if (cordova.platformId === "ios") {
    initIos();
  }
}

var initIos = function() { //initialize ios notifications
  FirebasePlugin.onApnsTokenReceived(function(token) {
    log("APNS token received: " + token)
  }, function(error) {
    logError("Failed to receive APNS token", error);
  });
};

var initAndroid = function() { //Initialize android notification

  // Custom FCM receiver plugin
  // cordova.plugin.customfcmreceiver.registerReceiver(function(message) {
  //   log("Received custom message: " + message);
  // });

  // Define custom  channel - all keys are except 'id' are optional.
  var customChannel = {
    // channel ID - must be unique per app package
    id: "my_channel_id",

    // Channel name. Default: empty string
    name: "My channel name",

    //The sound to play once a push comes. Default value: 'default'
    //Values allowed:
    //'default' - plays the default notification sound
    //'ringtone' - plays the currently set ringtone
    //filename - the filename of the sound file located in '/res/raw' without file extension (mysound.mp3 -> mysound)
    sound: "blackberry",

    //Vibrate on new notification. Default value: true
    //Possible values:
    //Boolean - vibrate or not
    //Array - vibration pattern - e.g. [500, 200, 500] - milliseconds vibrate, milliseconds pause, vibrate, pause, etc.
    vibration: [300, 200, 300],

    // Whether to blink the LED
    light: true,

    //LED color in ARGB format - this example BLUE color. If set to -1, light color will be default. Default value: -1.
    lightColor: "0xFF0000FF",

    //Importance - integer from 0 to 4. Default value: 3
    //0 - none - no sound, does not show in the shade
    //1 - min - no sound, only shows in the shade, below the fold
    //2 - low - no sound, shows in the shade, and potentially in the status bar
    //3 - default - shows everywhere, makes noise, but does not visually intrude
    //4 - high - shows everywhere, makes noise and peeks
    importance: 4,

    //Show badge over app icon when non handled pushes are present. Default value: true
    badge: true,

    //Show message on locked screen. Default value: 1
    //Possible values (default 1):
    //-1 - secret - Do not reveal any part of the notification on a secure lockscreen.
    //0 - private - Show the notification on all lockscreens, but conceal sensitive or private information on secure lockscreens.
    //1 - public - Show the notification in its entirety on all lockscreens.
    visibility: 1
  };

  FirebasePlugin.createChannel(customChannel,
    function() {
      log("Created custom channel: " + customChannel.id);
      FirebasePlugin.listChannels(
        function(channels) {
          if (typeof channels == "undefined") return;
          for (var i = 0; i < channels.length; i++) {
            log("Channel id=" + channels[i].id + "; name=" + channels[i].name);
          }
        },
        function(error) {
          logError('List channels error: ' + error);
        }
      );
    },
    function(error) {
      logError("Create channel error", error);
    }
  );
};

// Notifications
function checkNotificationPermission(requested) {
  FirebasePlugin.hasPermission(function(hasPermission) {
    if (hasPermission) {
      log("Remote notifications permission granted");
      // Granted
      getToken();
    } else if (!requested) {
      // Request permission
      log("Requesting remote notifications permission");
      FirebasePlugin.grantPermission(checkNotificationPermission.bind(this, true));
    } else {
      // Denied
      logError("Notifications won't be shown as permission is denied");
    }
  });
};

var checkAutoInit = function() {
  FirebasePlugin.isAutoInitEnabled(function(enabled) {
    log("Auto init is " + (enabled ? "enabled" : "disabled"));

  }, function(error) {
    logError("Failed to check auto init", error);
  });
};

var enableAutoInit = function() {
  FirebasePlugin.setAutoInitEnabled(true, function() {
    log("Enabled auto init");
    checkAutoInit();
  }, function(error) {
    logError("Failed to enable auto init", error);
  });
};

var disableAutoInit = function() {
  FirebasePlugin.setAutoInitEnabled(false, function() {
    log("Disabled auto init");
    checkAutoInit();
  }, function(error) {
    logError("Failed to disable auto init", error);
  });
};

var getID = function() {
  FirebasePlugin.getId(function(id) {
    log("Got FCM ID: " + id)
  }, function(error) {
    logError("Failed to get FCM ID", error);
  });
};

function getToken() {
  FirebasePlugin.getToken(function(token) {
    log("Got FCM token: " + token)
  }, function(error) {
    logError("Failed to get FCM token", error);
  });
};

var getAPNSToken = function() {
  FirebasePlugin.getAPNSToken(function(token) {
    log("Got APNS token: " + token)
  }, function(error) {
    logError("Failed to get APNS token", error);
  });
};

var handleNotificationMessage = function(message) {

  var title;
  if (message.title) {
    title = message.title;
  } else if (message.notification && message.notification.title) {
    title = message.notification.title;
  } else if (message.aps && message.aps.alert && message.aps.alert.title) {
    title = message.aps.alert.title;
  }

  var body;
  if (message.body) {
    body = message.body;
  } else if (message.notification && message.notification.body) {
    body = message.notification.body;
  } else if (message.aps && message.aps.alert && message.aps.alert.body) {
    body = message.aps.alert.body;
  }

  var msg = "Notification message received";
  if (message.tap) {
    msg += " (tapped in " + message.tap + ")";
  }
  if (title) {
    msg += '; title=' + title;
  }
  if (body) {
    msg += '; body=' + body;
  }
  msg += ": " + JSON.stringify(message);
  log(msg);
};

var handleDataMessage = function(message) {
  log("Data message received: " + JSON.stringify(message));
};


function clearNotifications() {
  FirebasePlugin.clearAllNotifications(function() {
    log("Cleared all notifications");
  }, function(error) {
    logError("Failed to clear notifications", error);
  });
}

function subscribe() {
  FirebasePlugin.subscribe("my_topic", function() {
    log("Subscribed to topic");
  }, function(error) {
    logError("Failed to subscribe to topic", error);
  });
}

function unsubscribe() {
  FirebasePlugin.unsubscribe("my_topic", function() {
    log("Unsubscribed from topic");
  }, function(error) {
    logError("Failed to unsubscribe from topic", error);
  });
}

function unregister() {
  FirebasePlugin.unregister(function() {
    log("Unregistered from Firebase");
  }, function(error) {
    logError("Failed to unregister from Firebase", error);
  });
}



// Remote config // NOTE:  Dunno what this is most likly useless? <--Ethan
function fetch() {
  FirebasePlugin.fetch(function() {
    log("Remote config fetched");
    //$$('#remote_activate').removeAttr('disabled');
  }, function(error) {
    logError("Failed to fetch remote config", error);
  });
}

function activateFetched() {
  FirebasePlugin.activateFetched(function(activated) {
    log("Remote config was activated: " + activated);
    if (activated) {
      //$('#remote_getValue').removeAttr('disabled');
    }
  }, function(error) {
    logError("Failed to activate remote config", error);
  });
}

function getValue() {
  FirebasePlugin.getValue("background_color", function(value) {
    log("Get remote config activated: " + value);
    if (value) {
      //  $('body').css('background-color', value);
    }
  }, function(error) {
    logError("Failed to activate remote config", error);
  });
}