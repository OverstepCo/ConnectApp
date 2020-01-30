/////User Data/////
//this is where evrer thing related to getting userdata should be

var firstName;
var lastName;
var bio;
var tagline;
var err;
var madeNewUser = false; // lets us know wether weve made a new user.(signed UP)
var anonymousProfilePic = "https://www.keypointintelligence.com/img/anonymous.png"; //This is the profile picture we set if we cant set anythihng else
//The object to return if the user is invalid
var invalidUser = {
  uid: 'invalid',
  username: 'Invalid User',
  firstName: 'Invalid',
  lastName: 'Invalid',
  tagline: 'Invalid',
  bio: 'Invalid',
  picURL: anonymousProfilePic,
};


var loadedUsers = {};
//Gets the data for the user specified by userID
function getUserData(userID, callback) {
  //Check to see if the user id is valid
  if (userID && userID != '') {
    //If we have already loaded this users data then return it else load it from the database
    if (userID in loadedUsers) {
      //console.log("Found user in array");
      callback(loadedUsers[userID]);
    } else {
      var profilePic = "";
      // Create a reference to the profile picture file we want to download
      var profilePictureRef = storageRef.child('profile-pictures').child(userID);
      // Get the download URL
      profilePictureRef.getDownloadURL().then(function(url) {
        profilePic = url;
      }).catch(function(error) {
        profilePic = anonymousProfilePic;
      }).then(function() {
        db.collection("users").doc(userID).get().catch(function(error) {
          //There has been a error so log the message and return the invalid user object
          console.log(error.message);
          callback(invalidUser);
        }).then(function(userData) {
          loadedUsers[userID] = {
            uid: userID,
            username: userData.get("firstName") + " " + userData.get("lastName"),
            firstName: userData.get("firstName"),
            lastName: userData.get("lastName"),
            tagline: userData.get("tagline"),
            bio: userData.get("bio"),
            picURL: profilePic,
            isFreind: (User.freinds.includes(userID)),
          };
          callback(loadedUsers[userID]);
        });
      });
    }
  } else {
    //The user id is invalid so return the invalid user object
    callback(invalidUser);
  }
}

//This loads the user page for this uid
function loadUserpage(userID) {
  //if the uid is the same as the Users id then load the local users page
  if (userID == User.uid) {
    app.panel.close();
    self.app.views.main.router.navigate('/profile-screen/');
  } else {

    //Get the users data
    getUserData(userID, function(user) {
      //Setup the profile prevew
      var profilePreview = document.createElement('div');
      profilePreview.classList.add("profile-preview");
      profilePreview.id = "profile-preview";
      profilePreview.addEventListener("click", function() {
        //closePreview();
      });
      profilePreview.innerHTML = '<div id="profile-preview-card" class="profile-preview-card"><div class="profile-pic" style="background-image: url(' + user.picURL +
        ')"></div><h2>' + user.username + '</h2><h4>' + user.tagline + '</h4>' +
        '<p>' + user.bio + '</p> <div class="row"> <a id="freind-' + userID + '" class="button button-round" >' + ((user.isFreind) ? "Remove Freind" : "Add Freind") + '</a><a class="button button-round" onclick="closePreview()">Close</a></div></div>';

      $$('body').append(profilePreview);

      //setup the add/remove freind button
      $$('#freind-' + userID).click(function() {
        if (user.isFreind) {
          removeFreind(userID);
        } else {
          addFreind(userID);
        }
      });

    });

    //document.body.appendChild(profilePreview);
  }
}

/////////////////////Local User stuff\\\\\\\\\\\\\\\\\\\\\\\\\\\\

var freindsList;

function loadFriends() { //Loads the current users freinds
  freindsList = document.getElementById('friends');
  freindsList.innerHTML = '';
  //forEach freind load their DATA THEN ADD THEM TO THE HTML
  User.freinds.forEach(function(freind) {
    getUserData(freind, function(user) {
      var a = document.createElement('a');
      a.classList.add("item-link");
      a.classList.add("no-chevron");
      a.onclick = function() {
        loadUserpage(freind);
      }
      a.innerHTML =
        '<li class="item-content">' +
        '<div class="item-media"><div class="profile-pic-icon" style="background-image: url(' + user.picURL +
        ')"></div></div>' +
        '<div class="item-inner">' + user.username + '</div>' +
        '</li>';
      freindsList.appendChild(a);
    });
  });
}

function addFreind(userID) { //Add the specified user to the freinds list
  db.collection("users").doc(User.uid).update({ //Updates the user freinds list
    freinds: firebase.firestore.FieldValue.arrayUnion(userID),
  }).then(function() { //After we sucessfully update the sever we update the local data
    console.log("Added friend");
    loadedUsers[userID].isFreind = true; //Update the local user object
    User.freinds.unshift(userID); //Add this freind to the local User freinds list
    $$('#freind-' + userID).html('Remove Freind'); //Change the add/remove freind button to the correct state
  });
}

function removeFreind(userID) { //Removes the specified user to the freinds list // NOTE:  we may be able to merge this with addFreind
  db.collection("users").doc(User.uid).update({ //Updates the user freinds list
    freinds: firebase.firestore.FieldValue.arrayRemove(userID) //Remove
  }).then(function() { //After we sucessfully update the sever we update the local dat
    console.log("Removed friend");
    loadedUsers[userID].isFreind = false; //Update the local user object
    const index = User.freinds.indexOf(userID);
    if (index > -1) {
      User.freinds.splice(index, 1); //Remove this freind from the local User freinds list
    }
    $$('#freind-' + userID).html('Add Freind'); //Change the add/remove freind button to the correct state
  });
}

function closePreview() { //This closes the profile preveiw card
  var el = document.getElementById("profile-preview");
  document.getElementById("profile-preview-card").classList.add("hidden");
  setTimeout(function() {
    el.parentNode.removeChild(el);
  }, 400);
}


function loadUserData() {
  console.log("loading User data");
  db.collection("users").doc(uid).get().then(function(userData) {
    //If the user data exists load the user data
    if (userData.exists) {
      //Check to see if they have a bio and tagline, if not direct them to the welcome page
      if (userData.get("bio") && userData.get("tagline")) {
        console.log("the user has a bio and a tagline");
        //Get the users profile picture
        var profilePic = "";
        var profilePictureRef = storageRef.child('profile-pictures').child(uid);
        profilePictureRef.getDownloadURL().then(function(url) {
          profilePic = url;
        }).catch(function(error) {
          //Iff there is a error l;oading the picture the set it to the anonymous profile picture
          profilePic = anonymousProfilePic;
        }).then(function() {
          //Store the user data in the User Object
          User = {
            uid: uid,
            firstName: userData.get("firstName"),
            lastName: userData.get("lastName"),
            school: userData.get("school"),
            fullName: function() {
              return "" + this.firstName + " " + this.lastName;
            },
            tagline: userData.get("tagline"),
            bio: userData.get("bio"),
            chats: userData.get("chatrooms") ? userData.get("chatrooms") : [],
            freinds: userData.get("freinds") ? userData.get("freinds") : [],
            profilePic: profilePic,
            picURL: profilePic,
          };

          //If the user has selected a valid school
          if (userData.get("school")) {
            loadMainPage();
          } else {
            //The users school is invalid so go to the school selection page
            console.log("the user needs to select a school");
            self.app.views.main.router.navigate('/school-search-page/', {});
          }
        });
      } else {
        //Go to the welcome page
        console.log("the user needs a bio or tagline");
        self.app.views.main.router.navigate('/welcome-page/', {
          reloadCurrent: true,
        });
      }
    } else {
      //if the user has no data they were just made or an error happened when setting there data//// TODO: this is an edge case and it should redirect the user to sign up page
      console.log("this user has no data");
      //If we just made this user then we should...
      if (madeNewUser) {
        //set their data...
        db.collection("users").doc(uid).set({
          firstName: firstName,
          lastName: lastName,
        }).then(function() {
          self.app.views.main.router.navigate('/home/', {});
          //and then we should load them.
          loadUserData();
        });
      }
      //Else if we did not make this user there has been an error.(most likely the app crashed while making the user or they lost internet connection at nearly the exact same time as they pressed signup)
      else {
        //// TODO: we should probably display a page that says"sorry there has been an error please try again" then we should ethier delete the account and then have them signup again or just redirect them to the signup page
      }
    }
  });

  app.preloader.hide();
}

//This replaces editUserData as it is robust
function setUserData(data, callback) {
  console.log('setting the users data');
  app.progressbar.show(localStorage.getItem("themeColor"));
  //If the data is not empty set it here
  if (data.bio && data.tagline) {
    console.log("updating user bio");
    db.collection("users").doc(uid).update({
      bio: data.bio,
      tagline: data.tagline
    }).then(function() {
      app.progressbar.hide();
      if (callback)
        callback();
    });
  }

  //update names
  if (data.firstName && data.lastName) {
    db.collection("users").doc(uid).update({
      firstName: data.firstName,
      lastName: data.lastName
    }).then(function() {
      app.progressbar.hide();
      if (callback)
        callback();
    });
  }
  //If the pic is not empty set it here
  if (data.profilePic && User) {
    var profilePictureRef = storageRef.child('profile-pictures').child(User.uid);
    profilePictureRef.put(data.profilePic).then(function(snapshot) {
      //Updated the picture successfully
      app.progressbar.hide();
    }).catch(function(error) {
      app.progressbar.hide();
      errorMessage += "Oops! " + error;
    });
  }
  //If the password is not empty set it there
  if (data.password) {
    var user = firebase.auth().currentUser;
    user.updatePassword(newPassword.value).then(function() {
      // Update successful.
      console.log("updated password");
    }).catch(function(error) {
      // An error happened.
      app.progressbar.hide();
      console.log("Failed to update password", error);
    });
  }

}
//Edits the users profile data.
function editUserData() {

  app.progressbar.show(localStorage.getItem("themeColor"));

  var updatedUserInfo = false;
  var updatedUserPic = false;
  var updatedUserPassword = false;
  var pageName = app.views.main.router.url;

  var errorMessage = document.getElementById("error-message");
  errorMessage.innerHTML = "";

  db.collection("users").doc(User.uid).update({
    //firstName: document.getElementById("firstName").value,
    //lastName: document.getElementById("lastName").value,
    tagline: document.getElementById("tagline").value,
    bio: document.getElementById("bio").value,

  }).then(function() {
    updatedUserInfo = true;
    if (updatedUserPic) {
      if (pageName == "/welcome-page/") {
        self.app.views.main.router.navigate('/school-search-page/');
      }

      app.progressbar.hide();
      app.toast.show({
        text: 'User info sucessfully updated!',
        closeTimeout: 2000,
      });
    }

  }).catch(function(error) {
    errorMessage.innerHTML += "Oops! " + error;
    console.error("Error updating user data: ", error);
    app.progressbar.hide();
  });

  var file = document.getElementById('profile-pic-input').files[0];
  var profilePictureRef = storageRef.child('profile-pictures').child(User.uid);
  profilePictureRef.put(file).then(function(snapshot) {
    updatedUserPic = true;
    if (updatedUserInfo) {

      if (pageName == "/welcome-page/") {
        self.app.views.main.router.navigate('/school-search-page/');
      }

      app.progressbar.hide();
      app.toast.show({
        text: 'User info sucessfully updated!',
        closeTimeout: 2000,
      });
    }
  }).catch(function(error) {
    app.progressbar.hide();
    errorMessage += "Oops! " + error;
  });

  var newPassword = document.getElementById("password");
  if (newPassword) {
    var user = firebase.auth().currentUser;
    user.updatePassword(newPassword.value).then(function() {
      // Update successful.
      console.log("updated password");
    }).catch(function(error) {
      // An error happened.
      app.progressbar.hide();

      console.log("Failed to update password", error);
    });
  }

}

function previewPic(event, location) {
  document.getElementById(location + '-pic-preview').style.backgroundImage = "url(" + URL.createObjectURL(event.target.files[0]) + ")";
  document.getElementById(location + '-pic-icon').innerHTML = "edit";
};




function signUp() { //signs up a new user
  app.progressbar.show(localStorage.getItem("themeColor"));
  console.log("signing up a new user");

  var email = document.getElementById("email").value;
  var password = document.getElementById("newpword").value;
  firstName = document.getElementById("firstName").value;
  lastName = document.getElementById("lastName").value;
  err = document.getElementById("newerrmsg");
  err.innerHTML = "";
  if (document.getElementById("age").value < 13) {
    err.innerHTML = "Oops! You must be 13 years of age or older to sign up.";
    app.progressbar.hide();
    return;
  }
  console.log(firstName);

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    app.progressbar.hide();
    err.innerHTML = "Oops! " + error.message;
    return;
  }).then(function() {
    madeNewUser = true;
  });
}

function signIn() { //Signs in a user
  app.progressbar.show(localStorage.getItem("themeColor"));
  var username = document.getElementById("uname").value;
  var password = document.getElementById("pword").value;
  var err = document.getElementById("errmsg");
  err.innerHTML = "";
  firebase.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
    app.progressbar.hide();
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Failed to login: " + error.message);
    err.innerHTML = "Oops! " + error.message;
  });
}

function signOut() { //Signs out the user
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    console.log("Failed to sign out: " + error.message);
  });
}

function previewPic(event) {
  document.getElementById('profile-pic-preview').style.backgroundImage = "url(" + URL.createObjectURL(event.target.files[0]) + ")";
  document.getElementById('profile-pic-icon').innerHTML = "edit";

  console.log("url(" + URL.createObjectURL(event.target.files[0]) + ")");
};

//Changes the users school //Maybe merge this with setUserData?
function changeSchool(newSchoolID) {
  console.log(User);
  var oldSchool;
  if (User.school) {
    oldSchool = User.school;
  }
  db.collection("users").doc(User.uid).update({
      school: newSchoolID
    })
    .then(function() {
      //Removes the user from the old school///// TODO: check if ther eis an old school
      if (oldSchool) {
        db.collection("school").doc(oldSchool).collection("users").doc(User.uid).delete().then(function() {
          console.log("Document successfully deleted! Document id: " + oldSchool);
          self.app.views.main.router.navigate('/home/', {
            reloadCurrent: true,
            ignoreCache: true,
          });
        }).catch(function(error) {
          console.error("Error removing document: ", error);
        });
      }
      //Adds the user to the new school
      db.collection("school").doc(newSchoolID).collection("users").doc(User.uid).set({
          name: "" + User.firstName + " " + User.lastName
        })
        .then(function() {
          console.log(" successfully added user to school");
        })
        .catch(function(error) {
          console.error("Error adding user to school: ", error);
        });


      loadUserData();
      console.log("user school successfully updated!");
      //TODO add user to user array

    })
    .catch(function(error) {
      console.error("Error updating user school: ", error);
    });

}

function searchSchools() { //Loads the schools from the database
  app.progressbar.show(localStorage.getItem("themeColor"));

  var query = document.getElementById("school-zip").value;
  var schoolsList = document.getElementById("schools-list");
  var foundSchools = false;

  //check for a valid zip code before search
  if (isNaN(query)) {
    schoolsList.innerHTML = '<div class="text-align-center">Please enter a valid zip code</div>';
    app.progressbar.hide();
    return;
  } else {
    var zip = parseInt(query);
  }

  schoolsList.innerHTML = "";

  //search database for schools with given zip code
  var schools = db.collection("school").where("zip", "==", zip);
  schools.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) { // add results to page
      foundSchools = true;
      var li = document.createElement('li');
      li.classList.add("card-block");
      li.innerHTML = '<h3>' + doc.get("name") +
        '</h3><div class="school-attributes"><p>' +
        doc.get("address") + ' ' + doc.get("city") + ', ' + doc.get("state") +
        '</p><p>' + doc.get("level") + ' School</p></div>' +
        '<button onclick="changeSchool(\'' + doc.id + '\')" class="button" style="width: auto">Select this School</button>';
      schoolsList.appendChild(li);

    });
  }).catch(function(error) {
    schoolsList.innerHTML += '<div class="text-align-center">Oops! ' + error + '</div>';
    app.progressbar.hide();
  }).then(function() {
    schoolsList.innerHTML += '<div class="text-align-center">Don\'t see your school?</div><div class="display-flex justify-content-center"><a class="text-align-center" href="/new-school-page/">Add a new school</a></div>';
    app.progressbar.hide();
  });
}

function createNewSchool() {
  db.collection("school").add({
    address: document.getElementById("school-address").value,
    city: document.getElementById("school-city").value,
    level: document.getElementById("school-level").value,
    name: document.getElementById("school-name").value,
    phone: document.getElementById("school-phone").value,
    state: document.getElementById("school-state").value,
    website: document.getElementById("school-website").value,
    zip: Number(document.getElementById("school-zip").value),
  }).then(function(docRef) {
    console.log("Added a new school to the server with ID: ", docRef.id);
    changeSchool(docRef.id);
  }).catch(function(error) {
    console.error("Error adding school: ", error);
    document.getElementById("newerrmsg").innerHTML = "Oops! " + error;
  });
}

function forgotPassword() {
  var email = $$('#email-reset').val();
  app.preloader.show();
  firebase.auth().sendPasswordResetEmail(email).then(function() {
    app.preloader.hide();
    app.toast.show({
      text: 'A password reset email was sent to your address.',
      closeTimeout: 10000,
    });
  }).catch(function(error) {
    app.preloader.hide();
    console.error(error.message);
    app.toast.show({
      text: error.message,
      closeTimeout: 10000,
    });
  });
}

var progressbarPercent = 0;

function setProgressbar(percent) {

  if (progressbarPercent == 0) app.progressbar.show(0, localStorage.getItem("themeColor"));

  progressbarPercent += percent;


  console.log("progress: " + progressbarPercent + "%");

  if (progressbarPercent >= 100) {
    app.progressbar.hide();
    progressbarPercent = 0;
    console.log("Progressbar Complete!");
    return;
  }

  app.progressbar.show(progressbarPercent, localStorage.getItem("themeColor"));

}