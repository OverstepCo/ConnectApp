  //////Chats/////


  var currentChat;
  var currentChatSchool;
  var finishedLoadingMessages = false;
  var loadingMessages = false;
  var totalMessages = 0;
  var oldestTimestamp;
  var usersInChat = [];

  // Max items to load
  var maxItems = 2000;

  //How many messages to load at at time. Probably should be no less than 50
  var messagesPerLoad = 50;

  //This is here so we can stop the listener when the page is destroyed
  var listener;


  var messages = null;




  function loadChat(chatID, chatSchool) {
    console.log("chatID:" + chatID + " school:" + chatSchool);
    currentChat = chatID;
    currentChatSchool = chatSchool
    self.app.views.main.router.navigate('/chat-screen/');
    console.log(app.views.main.router.url);
  }

  function previewChat(chatID, chatSchool) {
    console.log("chatID:" + chatID + " school:" + chatSchool);
    currentChat = chatID;
    currentChatSchool = chatSchool;
    self.app.views.main.router.navigate('/preview-chat-screen/');
  }

  function loadUser(uid) {
    var obj;
    db.collection("users").doc(user.id).get().then(function(userData) {
      obj = {
        userid: user.id,
        username: userData.get("firstName")
      }
    });
    return obj;
  }

  function setupChat() {
    console.log("setting up chat " + currentChatSchool + currentChat);
    var userList = document.getElementById("chat-members");
    oldestTimestamp = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("users").get().then(function(users) {
      var foo = 0;
      users.forEach(function(user) {
        db.collection("users").doc(user.id).get().then(function(userData) {
          usersInChat.push({
            userid: user.id,
            username: userData.get("firstName")
          });
          var a = document.createElement('div');
          a.classList.add("item-link");
          a.classList.add("no-chevron");

          a.innerHTML =
            '<li class="item-content">' +
            '<div class="item-media"><i class="material-icons">person</i></div>' +
            '<div class="item-inner">' + userData.get("firstName") + '</div>' +
            '</li>';
          userList.appendChild(a);

          foo++;
          if (foo >= users.size) {
            //console.log(usersInChat.find(o => o.userid === 'd2H6n7b80ee9vmRjemY0ZyFmuIv2').username);
            //Gets the last 20 messages from the chat room and adds them to the local messaging system
            db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("messages").orderBy("timestamp", "desc").limit(20).get().then(function(snapshot) {
                var messagesArray = []; //stores the messages to be added to the page
                var lastTimestamp;
                finishedLoadingMessages = false;
                loadingMessages = true;


                //Add each message in the snapshot to the message array
                snapshot.forEach(function(change) {
                  var un = "null";
                  if (usersInChat.find(o => o.userid === change.get("userID")) != null) {
                    un = usersInChat.find(o => o.userid === change.get("userID")).username;
                  }

                  messagesArray.unshift({
                    text: change.get("text"),
                    isTitle: change.get("isTitle"),
                    type: (change.get("userID") != User.uid) ? 'received' : 'sent',
                    name: un,
                    avatar: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.complex.com%2Fcomplex%2Fimage%2Fupload%2Fc_limit%2Cw_680%2Ffl_lossy%2Cpg_1%2Cq_auto%2Fe28brreh7mlxhbeegozo.jpg&f=1" //TODO get user picture
                  });
                  oldestTimestamp = change.get("timestamp");
                });

                // TODO: move timestamps to its own function and run when adding messages
                /*//Timestamps
                var i = 0;
                snapshot.docChanges().forEach(function(change) { //Dont know if this should be here. may cause problems
                  if (lastTimestamp && (lastTimestamp.getTime() - change.doc.get("timestamp").toDate().getTime()) > 86400000) {
                    var difference = (lastTimestamp.getTime() - change.doc.get("timestamp").toDate().getTime());
                    var timestampString;
                    i++;
                    //if this week
                    if ((lastTimestamp.getDay() - change.doc.get("timestamp").toDate().getDay()) >= 0) {
                      var now = new Date();
                      var today = now.getDay();

                      //if today
                      if (today == lastTimestamp.getDay()) {
                        timestampString = "Today, ";

                        //if another day this week
                      } else {
                        var daysArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        timestamp = daysArray[lastTimestamp.getDay()] + ", ";
                      }
                      //if not this week
                    } else {
                      var monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                      timestampString = monthsArray[lastTimestamp.getMonth()] + " " + (lastTimestamp.getDate() + 1) + ", ";
                    }
                    var hour = lastTimestamp.getHours();
                    timestampString += (hour < 12 || hour === 24) ? (hour + ":" + lastTimestamp.getMinutes() + " AM") : ((hour - 12) + ":" + lastTimestamp.getMinutes() + " PM");
                    messagesArray.splice(i, 0, {
                      text: timestampString,
                      isTitle: true,
                    });
                  }

                  console.log("Updated timestamps");
                  lastTimestamp = change.doc.get("timestamp").toDate();
                });*/

                //initialize the message system with rules. Note to self: probably dont mess with it
                messages = app.messages.create({ //Some rules and stuff
                  el: '.chatroom-messages',
                  messages: messagesArray,
                  // First message rule
                  firstMessageRule: function(message, previousMessage, nextMessage) {
                    // Skip if title
                    if (message.isTitle) return false;
                    /* if:
                      - there is no previous message
                      - or previous message type (send/received) is different
                      - or previous message sender name is different
                    */
                    if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name) return true;
                    return false;
                  },
                  // Last message rule
                  lastMessageRule: function(message, previousMessage, nextMessage) {
                    // Skip if title
                    if (message.isTitle) return false;
                    /* if:
                      - there is no next message
                      - or next message type (send/received) is different
                      - or next message sender name is different
                    */
                    if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
                    return false;
                  },
                  // Last message rule
                  tailMessageRule: function(message, previousMessage, nextMessage) {
                    // Skip if title
                    if (message.isTitle) return false;
                    /* if (bascially same as lastMessageRule):
                      - there is no next message
                      - or next message type (send/received) is different
                      - or next message sender name is different
                    */
                    if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
                    return false;
                  }
                });

                //Adds a listener for any new chat messages
                listener = db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("messages").orderBy("timestamp", "asc")
                  .onSnapshot(function(snapshot) {
                      if (finishedLoadingMessages) { //only add mesages if we are not currently seting up the chat
                        snapshot.docChanges().forEach(function(change) { //Change + the new message anf the foreach loop runs for each new message
                          if (change.type === "added") {
                            console.log("added new message");
                            messages.addMessage({
                              text: change.doc.get("text"),
                              isTitle: change.doc.get("isTitle"),
                              type: (change.doc.get("userID") != User.uid) ? 'received' : 'sent',
                              name: usersInChat.find(o => o.userid === change.doc.get("userID")).username,
                              avatar: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.complex.com%2Fcomplex%2Fimage%2Fupload%2Fc_limit%2Cw_680%2Ffl_lossy%2Cpg_1%2Cq_auto%2Fe28brreh7mlxhbeegozo.jpg&f=1" //TODO get user picture
                            });
                          }
                        });
                      }
                      finishedLoadingMessages = true;
                      loadingMessages = false;
                      console.log("done loading messages");
                      //...
                    },
                    function(error) {
                      //...
                    });

                // Attach 'infinite' event handler
                $$('.infinite-scroll-content').on('infinite', function() {
                  if (!loadingMessages) {
                    console.log("loading messsages: " + loadingMessages);
                    if (totalMessages >= maxItems) {
                      // Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
                      app.infiniteScroll.destroy('.infinite-scroll-content');
                      // Remove preloader
                      $$('.infinite-scroll-preloader').remove();
                      return;
                    }
                    loadingMessages = true;
                    loadChatMessages();
                  } else {
                    {
                      console.log("already loading Messages");
                    }
                  }
                });

                // Init Messagebar
                var messagebar = app.messagebar.create({
                  el: '.chat-messagebar'
                });

                // Response flag ///////Not used currently
                var responseInProgress = false;

                // Send Message
                $$('.chat-send-link').on('click', function() {
                  var text = messagebar.getValue().replace(/\n/g, '<br>').trim();
                  // return if empty message
                  if (!text.length) return;
                  // Clear area
                  messagebar.clear();
                  // Return focus to area
                  messagebar.focus();
                  //Add message to the server.
                  addMessage(currentChatSchool, currentChat, text);
                  if (responseInProgress) return;
                  // Receive dummy message
                });
                //...
              },
              function(error) {
                //...
              });

          }
        });
      });
    });


  }

  function loadChatMessages() {
    console.log("loading more chat messages");
    if (finishedLoadingMessages) {
      totalMessages += messagesPerLoad;

      db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("messages").where('timestamp', '<', oldestTimestamp).orderBy("timestamp", "desc").limit(totalMessages)
        .get().then(function(snapshot) {
          if (snapshot.size < 1) {
            console.log("There are no more messages in this chatroom.");
            // Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
            app.infiniteScroll.destroy('.infinite-scroll-content');
            // Remove preloader
            $$('.infinite-scroll-preloader').remove();
          }
          snapshot.forEach(function(doc) {
            oldestTimestamp = doc.get("timestamp");
            messages.addMessage({
              text: doc.get("text"),
              isTitle: doc.get("isTitle"),
              type: (doc.get("userID") != User.uid) ? 'received' : 'sent',
              name: usersInChat.find(o => o.userid === doc.get("userID")).username,
              avatar: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.complex.com%2Fcomplex%2Fimage%2Fupload%2Fc_limit%2Cw_680%2Ffl_lossy%2Cpg_1%2Cq_auto%2Fe28brreh7mlxhbeegozo.jpg&f=1" //TODO get user picture
            }, "prepend");
            loadingMessages = false;
          });
          //...
        });
    } else {
      console.log("Not finished setting up chat room aborting");
    }
  }

  function addMessage(school, chatID, message) { //Adds a message to the specified chatroom.
    db.collection("school").doc(school).collection("chats").doc(chatID).collection("messages").add({
        userID: User.uid,
        name: User.fullName(),
        profilePicUrl: "https://lh4.googleusercontent.com/-bDz3d4hCLzA/AAAAAAAAAAI/AAAAAAAAAEk/xwohCLOzw7c/photo.jpg", //TODO change this to the users profile pic
        text: message, //document.getElementById("messagebar").value, //not sure if this is the best way to do this
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(function(docRef) {
        console.log("Sent message: ", docRef.id);
      })
      .catch(function(error) {
        console.error("Error sending message : ", error);
      });
  }

  //Subscribes a user to the specified chat
  function subscribeToChat(uid, chatID) {
    console.log("subscribing to chat: " + chatID);
    //Adds the user to the chat members
    db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("users").doc(User.uid).set({
      subscribed: true
    });
    //Adds the chatroom to the users chat list
    db.collection("users").doc(User.uid).update({
      chatrooms: firebase.firestore.FieldValue.arrayUnion(currentChat + "," + currentChatSchool),
    });
  }

  //Unsubscribes the user from the specified chat.
  function unsubscribeFromChat() {

    db.collection("users").doc(User.uid).collection("chats").doc(currentChat).delete().then(function() {
      console.log("successfully unsubscribed from chat");
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    // TODO: Change this so that it works when users change names
    db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("users").doc(User.uid).set({
      subscribed: false
    });
    //Removes the chatroom from the users chat list
    db.collection("users").doc(User.uid).update({
      chatrooms: firebase.firestore.FieldValue.arrayRemove(currentChat + "," + currentChatSchool),
    });
    console.log("unsubscribing from: " + currentChat + "," + currentChatSchool);
  }

  //NEW CHAT Room-----------------------------------------------------------------
  function createChat() {
    var chatName = document.getElementById("chat-name");
    var chatDescription = document.getElementById("chat-description");
    //chatMembers is an array
    var chatMembers = document.querySelectorAll('[data-uid]');
    console.log(chatMembers.length);
    console.log("new chat");
    //create chat on database
    db.collection('school').doc(User.school).collection("chats").doc(chatName.value).set({
        description: chatDescription.value,
        name: chatName.value,
        numberOfMembers: "" + chatMembers.length,
      })
      .then(function() {
        console.log("Chat written with ID: ", chatName.value);
        //  addMessage(User.school, chatName.value, User.firstName + " " + User.lastName + " created this room");

        db.collection("school").doc(User.school).collection("chats").doc(chatName.value).collection("messages").add({
          userID: User.uid,
          name: User.fullName(),
          isTitle: true,
          profilePicUrl: "https://lh4.googleusercontent.com/-bDz3d4hCLzA/AAAAAAAAAAI/AAAAAAAAAEk/xwohCLOzw7c/photo.jpg", //TODO change this to the users profile pic
          text: "<b>" + User.firstName + " " + User.lastName + "</b> created this room", //document.getElementById("messagebar").value, //not sure if this is the best way to do this
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
      })
      .catch(function(error) {
        console.error("Error adding chat: ", error);
      });

    //subscribe added users to chat
    for (var i = 0; i < chatMembers.length; i++) {
      subscribeToChat(chatMembers[i], User.school);
    }
  }

  function addChip(li) {
    //if the user isn't already added
    if (li.dataset.checked == 0) {
      var chipsDiv = document.getElementById("chips-div");
      //create a new chip
      var chip = document.createElement('div');
      chip.classList.add("chip");
      chip.innerHTML = '<div class="chip-media">\
  <div class="chip-pic" style="background-image: url(\'' + li.dataset.pic + '\')"></div>\
  </div>\
  <div class="chip-label">' + li.dataset.name + '</div>\
  <a href="#" onclick="removeChip(this, \'' + li.dataset.uid + '\')" class="chip-delete"></a>';

      //add chip to the screen
      chipsDiv.appendChild(chip);

      //add a check mark to the added user
      var rightDiv = li.querySelector('.right');
      rightDiv.innerHTML = '<i class="material-icons">check</i>';
      li.dataset.checked = 1;
    }
  }

  function removeChip(chip, uid) {
    //find user in the list and uncheck it
    var li = document.querySelectorAll('[data-uid="' + uid + '"]');
    li = li[0];
    var rightDiv = li.querySelector('.right');
    rightDiv.innerHTML = '';
    li.dataset.checked = 0;

    //remove chip
    chip.parentNode.parentNode.removeChild(chip.parentNode);
  }