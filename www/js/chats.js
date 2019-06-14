//////Chats/////


//Subscribes a user to the specified chat
function subscribeToChat(uid, chatID) {
  console.log("subscribing to chat: " + chatID);
  db.collection("users").doc(uid).collection("chats").doc(chatID).set({
    school: currentChatSchool
  });
}

function unsubscribeFromChat() { //Unsubscribes the user from the specified chat.
  db.collection("users").doc(User.uid).collection("chats").doc(currentChat).update({
    school: firebase.firestore.FieldValue.delete()
  });
  db.collection("users").doc(User.uid).collection("chats").doc(currentChat).delete().then(function() {
    console.log("successfully unsubscribed from chat");
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });;
}
var currentChat;
var currentChatSchool;

function loadChat(chatID, chatSchool) {
  console.log("chatID:" + chatID + " school:" + chatSchool);
  currentChat = chatID;
  currentChatSchool = chatSchool
  self.app.views.main.router.navigate('/chat-screen/');
  console.log(app.views.main.router.url);

}

var listener; //This is here so w can stop the listener when the page is destroyed

function setupChat() {
  console.log("setting up chat " + currentChatSchool + currentChat);
  var messages = app.messages.create({ //Some rules and stuff
    el: '.messages',
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

  // Init Messagebar
  var messagebar = app.messagebar.create({
    el: '.messagebar'
  });

  // Response flag
  var responseInProgress = false;

  // Send Message
  $$('.send-link').on('click', function() {
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

  //loads the chat messages and add a listener for any new chat messages
  listener = db.collection("school").doc(currentChatSchool).collection("chats").doc(currentChat).collection("messages").orderBy("timestamp", "asc")
    .onSnapshot(function(snapshot) { //Listens to the chat room for any new messages.
        snapshot.docChanges().forEach(function(change) {
          if (change.type === "added") {
            console.log(change.doc.get("text"));
            messages.addMessage({
              text: change.doc.get("text"),
              type: (change.doc.get("userID") != User.uid) ? 'received' : 'sent',
              name: change.doc.get("name"),
              avatar: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fimages.complex.com%2Fcomplex%2Fimage%2Fupload%2Fc_limit%2Cw_680%2Ffl_lossy%2Cpg_1%2Cq_auto%2Fe28brreh7mlxhbeegozo.jpg&f=1" //TODO get user picture
            });
          }
        });
        //...
      },
      function(error) {
        //...
      });
  //document.getElementById("group-name").innerHTML = "whaaa";
  //  messages.addMessage({
  //  text: "helooo",
  //});
}

function previewChat(chatID, chatSchool) {
  console.log("chatID:" + chatID + " school:" + chatSchool);
  currentChat = chatID;
  currentChatSchool = chatSchool;
  self.app.views.main.router.navigate('/preview-chat-screen/');
}

function loadChatMessages(chatID, chatSchool) {



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
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
}


//----------Lazy Load----------//
// Loading flag
var allowInfinite = true;

var totalMessages = 0;

// Max items to load
var maxItems = 2000;

// Append items per load
var messagesPerLoad = 20;

// Attach 'infinite' event handler
$$('.infinite-scroll-content').on('infinite', function() {
  // Exit, if loading in progress
  if (!allowInfinite) return;

  // Set loading flag
  allowInfinite = false;

  lazyLoad();
});

function lazyLoad() {


  if (totalMessages >= maxItems) {
    // Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
    app.infiniteScroll.destroy('.infinite-scroll-content');
    // Remove preloader
    $$('.infinite-scroll-preloader').remove();
    return;
  }

  // TODO: load messages from DB
  //
  //
  //
  //
  totalMessages++;

  // Reset loading flag
  allowInfinite = true;
}




//NEW CHAT PAGE-----------------------------------------------------------------

function createChat() {
  var chatName = document.getElementById("chat-name");
  var chatDescription = document.getElementById("chat-description");
  //chatMembers is an array
  var chatMembers = document.querySelectorAll('[data-uid]');
  console.log(chatMembers.length);
  //create chat on database
  db.collection('school').doc(User.school).collection("chats").add({
      description: chatDescription.value,
      name: chatName.value,
      numberOfMembers: "" + chatMembers.length,
    })
    .then(function(docRef) {
      console.log("Chat written with ID: ", docRef.id);
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