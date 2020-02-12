  //////Chats/////

  var loadingMessages = false;
  var maxItems = 2000; //Max items to load
  var messagesPerLoad = 50; //How many messages to load at at time. Probably should be no less than 50
  var listener; //A referance to the database listener so we can destroy it when needed
  var messages = null; //Referance to framework7 messages


  function addMessage(chatID, school, message) { //Adds a message to the specified chatroom.
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

  function joinChat(chatID, chatSchool) { //Subscribes a user to the specified chat
    app.preloader.show();
    console.log("subscribing User to chat: " + chatID);
    db.collection("school").doc(chatSchool).collection("chats").doc(chatID).collection("users").doc(User.uid).set({ //Adds the user to the chat members
      subscribed: true
    });

    db.collection("users").doc(User.uid).update({ //Adds the chatroom to the users chat list
      chatrooms: firebase.firestore.FieldValue.arrayUnion(chatID + "," + chatSchool),
    }).then(function() {
      app.preloader.show();
      loadUserData(); //Reload the user data so the app reflects the changes in the chats
    }).catch(function() {
      app.preloader.show();
      loadUserData(); //Reload the user data so the app reflects the changes in the chats
    });

  }


  function leaveChat(chatID, chatSchool) { //Unsubscribes the user from the specified chat.
    console.log("unsubscribing from: " + chatID + "," + chatSchool);

    db.collection("school").doc(chatSchool).collection("chats").doc(chatID).collection("users").doc(User.uid).set({
      subscribed: false
    });

    db.collection("users").doc(User.uid).update({ //Removes the chatroom from the users chat list
      chatrooms: firebase.firestore.FieldValue.arrayRemove(chatID + "," + chatSchool),
    }).then(function() {
      loadUserData();
    }).catch(function() {
      loadUserData();
    });
  }

  //NEW CHAT Room
  function createChat() {
    var chatName = document.getElementById("chat-name");
    var chatDescription = document.getElementById("chat-description");

    if (chatName.value == "" || chatDescription.value == "") {
      showToast("Please fill in all fields to create a chat.");
      return;
    }
    //chatMembers is an array
    var chatMembers = document.querySelectorAll('[data-uid]');
    console.log(chatMembers.length);
    console.log("new chat");
    app.preloader.show();
    //create chat on database
    db.collection('school').doc(User.school).collection("chats").doc(chatName.value).set({
        description: chatDescription.value,
        name: chatName.value,
        numberOfMembers: "" + chatMembers.length,
      })
      .then(function() {
        console.log("Chat written with ID: ", chatName.value);

        app.preloader.hide();
        joinChat(chatName.value, User.school);
        showToast("Your chat was created!");
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
        app.preloader.hide();
        showToast("There was an error creating your chat. Please try again later.").
        console.error("Error adding chat: ", error);
      });

    //// TODO: invite other users
  }

  function loadChat(chatID, chatSchool) {
    console.log("chatID:" + chatID + " school:" + chatSchool);
    self.app.views.main.router.navigate('/chat-screen/', {
      on: {
        pageAfterIn: function test(e, page) {
          messages.scroll(1, 10000); //Scroll to the bottom of the messages
        },
        pageInit: function() { //On page init setup the chat
          console.log('chat page init');
          setupChat(chatID, chatSchool);
          $$("#leave-chat").click(function() {
            leaveChat(chatID, chatSchool);
          });
        },
        pageBeforeRemove: function(e, page) { //Before we leave this chatroom
          console.log('page before remove');
          listener();
          app.messages.destroy('.messages');
        },
      }
    });
  }

  function previewChat(chatID, chatSchool) {
    console.log("chatID:" + chatID + " school:" + chatSchool);
    self.app.views.main.router.navigate('/preview-chat-screen/', {
      on: {
        pageAfterIn: function test(e, page) {
          messages.scroll(1, 10000); //Scroll to the bottom of the messages
        },
        pageInit: function() { //On page init setup the chat
          console.log('chat page init');
          setupChat(chatID, chatSchool);
          $$("#join-chat").click(function() {
            console.log("clicked join");
            joinChat(chatID, chatSchool);
          });
        },
        pageBeforeRemove: function(e, page) { //Before we leave this chatroom
          console.log('page before remove');
          listener();
          app.messages.destroy('.messages');
        },
      }
    });
  }

  function setupChat(chatID, chatSchool) {

    oldestTimestamp = '';
    newestTimestamp = '';
    messagesArray = [];

    document.getElementById("chat-name").innerHTML = chatID; //Set the chat name
    var userList = document.getElementById("chat-members");
    db.collection("school").doc(chatSchool).collection("chats").doc(chatID).collection("users").get().then(function(users) {
      users.forEach(function(u) {
        console.log();
        if (u.get("subscribed")) {
          getUserData(u.id, function(user) {
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
          });
        }
      });
    });


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
      snapshot.docChanges().forEach(function(change) { //ForEach change in the snapshot
        console.log("ch-ch-ch-ch-changes");
        if ((change.type == "added" || change.type === "modified") && !snapshot.metadata.hasPendingWrites) { //We check to see if it is added information or modified information then we check to make sure it is from the server with !snapshot.metadata.hasPendingWrites
          addMessageTochatUI(change.doc.get("text"), change.doc.get("isTitle"), change.doc.get('userID'), change.doc.get("timestamp")); //Add the message to the chat ui
        }
      });
    });

    $$('.infinite-scroll-content').on('infinite', function() { //Setup the infinite scroll for messages
      if (!loadingMessages) { //If we are not currently loading messages
        loadingMessages = true;
        db.collection("school").doc(chatSchool).collection("chats").doc(chatID).collection("messages").where('timestamp', '<', oldestTimestamp).orderBy("timestamp", "desc").limit(messagesPerLoad)
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
      addMessage(chatID, chatSchool, text); //Add message to the server.
    });

  }

  var messagesArray = [];
  var oldestTimestamp = '';
  var newestTimestamp = '';

  function addMessageTochatUI(text, isTitle, senderID, timestamp) { //This adds the given message to the UI // NOTE: This does not add the message to the database
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