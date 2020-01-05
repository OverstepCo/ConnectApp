  //////Chats/////

  var currentChat;
  var currentChatSchool;
  var finishedLoadingMessages = false;
  var loadingMessages = false;
  var totalMessages = 0;
  var usersInChat = [];

  var maxItems = 2000; //Max items to load

  var messagesPerLoad = 50; //How many messages to load at at time. Probably should be no less than 50

  var listener; //A referance to the database listener so we can destroy it when needed

  var messages = null;


  function addMessage(school, chatID, message) { //Adds a message to the specified chatroom.
    db.collection("school").doc(school).collection("chats").doc(chatID).collection("messages").add({
        userID: User.uid,
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

  function subscribeToChat(chatID) { //Subscribes a user to the specified chat
    console.log("subscribing User to chat: " + chatID);
    db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("users").doc(User.uid).set({ //Adds the user to the chat members
      subscribed: true
    });

    db.collection("users").doc(User.uid).update({ //Adds the chatroom to the users chat list
      chatrooms: firebase.firestore.FieldValue.arrayUnion(currentChat + "," + currentChatSchool),
    });

    loadUserData(); //Reload the user data so the app reflects the changes in the chats
  }


  function unsubscribeFromChat() { //Unsubscribes the user from the specified chat.
    console.log("unsubscribing from: " + currentChat + "," + currentChatSchool);

    db.collection("users").doc(User.uid).collection("chats").doc(currentChat).delete().then(function() {
      console.log("successfully unsubscribed from chat");
      loadUserData();
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });

    db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("users").doc(User.uid).set({
      subscribed: false
    });

    db.collection("users").doc(User.uid).update({ //Removes the chatroom from the users chat list
      chatrooms: firebase.firestore.FieldValue.arrayRemove(currentChat + "," + currentChatSchool),
    });
  }

  //NEW CHAT Room
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
      //// TODO: send a notification instead of just subscribing them to chat
      subscribeToChat(chatMembers[i], User.school);
    }
  }

  var messagesArray = [];
  var oldestTimestamp = '';
  var newestTimestamp = '';

  async function addMessageTochatUI(text, isTitle, senderID, timestamp) {
    getUserData(senderID, function(user) { //Load the user data of the message sender so we can get their picture and name
      var message = {
        text: text,
        isTitle: false, //change.doc.get("isTitle"),
        type: ((user.uid == User.uid) ? 'sent' : 'received'),
        name: user.username,
        avatar: user.picURL,
        timestamp: timestamp.seconds
      };
      messagesArray.unshift(message); //Add the massage to our array
      messagesArray.sort((a, b) => a.timestamp - b.timestamp); //Sort our message array by timestamp

      if (newestTimestamp == '' || timestamp > newestTimestamp) { //This message is newer than our other messages so append it to the message system
        newestTimestamp = timestamp;
        messages.addMessage(message, "append");
        console.log("newer message");
      } else if (oldestTimestamp == '' || timestamp < oldestTimestamp) { //This message is older than our other messages so prepend it to the message system
        oldestTimestamp = timestamp;
        messages.addMessage(message, "prepend");
        console.log("older message");
      } else { //This message is in between our messages so add it to the array and recalculate the messages
        console.log("message is weird: ");
        console.log(message);
        //messages.clear(); //clear framework7's message system
        messages.messages = messagesArray.slice(); //Set framework7's messagesArray to a copy of our array
        messages.renderMessages(); //Tell framework7 to render the messages html
        messages.layout(); //This tells framewoork 7 to touch up the html. Needed for images and usernames
      }
      return 1;
      //console.log("message");
    });
  }


  function loadChat(chatID, chatSchool) {
    console.log("chatID:" + chatID + " school:" + chatSchool);
    currentChat = chatID;
    currentChatSchool = chatSchool
    self.app.views.main.router.navigate('/chat-screen/', {
      on: {
        pageAfterIn: function test(e, page) {
          // do something after page gets into the view
          //setupChat();
          messages.scroll(1, 10000); //Scroll to the bottom of the messages

        },
        pageInit: function() { //On page init setup the chat
          console.log('chat page init');

          oldestTimestamp = '';
          newestTimestamp = '';
          messagesArray = [];

          //Initialize framework7s message system with rules. Note to self: probably dont mess with it
          messages = app.messages.create({ //Some rules and stuff
            el: '.chatroom-messages',
            scrollMessages: true,
            messages: [],
            // First message rule
            firstMessageRule: function(message, previousMessage, nextMessage) {
              // Skip if title
              if (!message || message.isTitle) return false;

              if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name) return true;
              return false;
            },
            // Last message rule
            lastMessageRule: function(message, previousMessage, nextMessage) {
              // Skip if title
              if (!message || message.isTitle) return false;
              if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
              return false;
            },
            // Last message rule
            tailMessageRule: function(message, previousMessage, nextMessage) {
              // Skip if title
              if (!message || message.isTitle) return false;
              if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
              return false;
            }
          });

          listener = db.collection("school").doc(chatSchool).collection("chats").doc(chatID).collection("messages").orderBy("timestamp", "desc").limit(20).onSnapshot({ //Adds a listener for chat messages
            includeMetadataChanges: true
          }, function(snapshot) {
            snapshot.docChanges().forEach(function(change) { //ForEach changed in the snapshot
              if ((change.type == "added" || change.type === "modified") && !snapshot.metadata.hasPendingWrites) { //We check to see if it is added information or modified information then we check to make sure it is from the server with !snapshot.metadata.hasPendingWrites
                addMessageTochatUI(change.doc.get("text"), change.doc.get("isTitle"), change.doc.get('userID'), change.doc.get("timestamp")); //Add the message to the chat ui
              }
            });
          });

          $$('.infinite-scroll-content').on('infinite', function() { //Setup the infinite scroll for messages
            if (!loadingMessages) { //If we are not currently loading messages
              loadingMessages = true;
              db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("messages").where('timestamp', '<', oldestTimestamp).orderBy("timestamp", "desc").limit(messagesPerLoad)
                .get().then(function(snapshot) {
                  if (snapshot.size < 1) {
                    console.log("There are no more messages in this chatroom.");
                    app.infiniteScroll.destroy('.infinite-scroll-content'); // Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
                    $$('.infinite-scroll-preloader').remove(); // Remove preloader
                  }
                  snapshot.forEach(function(doc) {
                    // console.log("start add " + doc.get("text"));

                    addMessageTochatUI(doc.get("text"), doc.get("isTitle"), doc.get('userID'), doc.get("timestamp")); //Add the message to the chat ui

                  });
                  loadingMessages = false;

                });
            } else {
              console.log("already loading Messages");
            }

          });

          var messagebar = app.messagebar.create({ //Init Messagebar
            el: '.chat-messagebar'
          });

          $$('.chat-send-link').on('click', function() { //Send Message button
            var text = messagebar.getValue().replace(/\n/g, '<br>').trim();
            if (!text.length) return; //Return if the message is empty
            messagebar.clear(); //Clear area
            messagebar.focus(); //Return focus to area
            addMessage(currentChatSchool, currentChat, text); //Add message to the server.
          });

        },
        pageBeforeRemove: function(e, page) { //Before we leave this chatroom
          console.log('page before remove');
          listener();
          app.messages.destroy('.messages');
        },
      }
    });
    console.log(app.views.main.router.url);
  }

  function previewChat(chatID, chatSchool) {
    console.log("chatID:" + chatID + " school:" + chatSchool);
    currentChat = chatID;
    currentChatSchool = chatSchool;
    self.app.views.main.router.navigate('/preview-chat-screen/');
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

          var lastTimestamp;

          snapshot.forEach(function(doc) {

            //add timestamps
            var timestamp = doc.get("timestamp").toDate();
            //86400000ms = 1 day
            if (lastTimestamp != null && lastTimestamp - timestamp.getTime() > 86400000) {
              messages.addMessage({
                text: formatTimeStamp(lastTimestamp),
                isTitle: true,
              }, "prepend");
            }

            oldestTimestamp = doc.get("timestamp");
            messages.addMessage({
              text: doc.get("text"),
              isTitle: doc.get("isTitle"),
              type: (doc.get("userID") != User.uid) ? 'received' : 'sent',
              name: usersInChat.find(o => o.userid === doc.get("userID")).username,
              avatar: doc.get("profilePicUrl"),
            }, "prepend");
            loadingMessages = false;

            lastTimestamp = timestamp;
          });
          //...
        });
    } else {
      console.log("Not finished setting up chat room aborting");
    }
  }

  function setupChat() {
    console.log("setting up chat " + currentChatSchool + currentChat);
    document.getElementById("group-name").innerHTML = currentChat;
    var userList = document.getElementById("chat-members");
    oldestTimestamp = firebase.firestore.FieldValue.serverTimestamp();


    db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("users").get().then(function(users) {
      var foo = 0; //this is for keeping track of how many users we have loaded
      users.forEach(function(u) {
        //Get the user data using our async method then add them to an array to be used while this chat session is actvie
        getUserData(u.id, function(user) {
          //Add the user to a local array so that we can accses it without an async method
          usersInChat.push({
            userid: user.uid,
            username: user.username,
            pic: user.picURL
          });
          //Add an icon for each user subscribed to this chat to the members section
          var a = document.createElement('a');
          a.classList.add("item-link");
          a.classList.add("no-chevron");
          a.onclick = function() {
            loadUserpage(user.uid);
          };
          a.innerHTML =
            '<li class="item-content"><div class="item-media">' +
            '<div class="profile-pic-icon" style="background-image: url(' + user.picURL + ')"></div>' +
            '</div>' +
            '<div class="item-inner">' + user.username + '</div>' +
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
                  //add timestamps
                  var timestamp = change.get("timestamp").toDate();
                  //86400000ms = 1 day
                  if (lastTimestamp != null && lastTimestamp - timestamp.getTime() > 86400000) {
                    messagesArray.unshift({
                      text: formatTimeStamp(lastTimestamp),
                      isTitle: true,
                    });
                  }

                  var un = "null";
                  var up = "https://www.keypointintelligence.com/img/anonymous.png";
                  //this is just to make sure that the app doesnt break when there is no uid associated with the message
                  if (usersInChat.find(o => o.userid === change.get("userID")) != null) {
                    un = usersInChat.find(o => o.userid === change.get("userID")).username;
                    up = usersInChat.find(o => o.userid === change.get("userID")).pic;
                  }
                  messagesArray.unshift({
                    text: change.get("text"),
                    isTitle: change.get("isTitle"),
                    type: (change.get("userID") != User.uid) ? 'received' : 'sent',
                    name: un,
                    avatar: up,
                  });
                  oldestTimestamp = change.get("timestamp");
                  lastTimestamp = timestamp;
                });

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
                            messages.addMessage({
                              text: change.doc.get("text"),
                              isTitle: change.doc.get("isTitle"),
                              type: (change.doc.get("userID") != User.uid) ? 'received' : 'sent',
                              name: usersInChat.find(o => o.userid === change.doc.get("userID")).username,
                              avatar: usersInChat.find(o => o.userid === change.doc.get("userID")).pic,
                            });
                          }
                          var source = snapshot.metadata.fromCache ? "local cache" : "server";
                          console.log("This message came from " + source + "this can be used to notify the user that this massage has not been added to the server");
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
  <div class="chip-label">' + li.dataset.name.split(" ")[0] + " " + li.dataset.name.split(" ")[1].charAt(0).toUpperCase() + "." + '</div>\
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