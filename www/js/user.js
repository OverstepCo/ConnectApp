/////User Data/////
//this is where evrer thing related to getting userdata should be

var firstName;
var lastName;
var bio;
var tagline;
var err;
var madeNewUser = false; // lets us know wether weve made a new user.(signed UP)


//This loads the user page for this uid
function loadUserpage(uid) {
  //if the uid is the same as the Users id then load the local users page
  if (uid == User.uid) {
    app.panel.close();
    self.app.views.main.router.navigate('/profile-screen/');
  } else {
    //Load the preveiw page of the user with uid
    var profilePreview = document.createElement('div');
    profilePreview.classList.add("profile-preview");
    profilePreview.id = "profile-preview";
    profilePreview.addEventListener("click", function() {
      //closePreview();
    });
    //Get the users data
    getUserData(uid, function(user) {
      profilePreview.innerHTML = '<div id="profile-preview-card" class="profile-preview-card"><div class="profile-pic" style="background-image: url(' + user.picURL +
        ')"></div><h2>' + user.username + '</h2><h4>' + user.tagline + '</h4>' +
        '<p>' + user.bio + '</p> <div class="row"> <a class="button button-round" onclick="addFreind(\'' + uid + '\')">' + ((user.isFreind) ? "Remove Freind" : "Add Freind") + '</a><a class="button button-round" onclick="closePreview()">Close</a></div></div>';
    });

    document.body.appendChild(profilePreview);
  }
}

/////////////////////Local User stuff\\\\\\\\\\\\\\\\\\\\\\\\\\\\


//Add the specified user to the freinds list
function addFreind(uid) {
  //Updates the user freinds list // TODO: update the local data to reflect this
  db.collection("users").doc(User.uid).update({
    freinds: firebase.firestore.FieldValue.arrayUnion(uid),
    //freinds: firebase.firestore.FieldValue.arrayRemove(uid)//Remove
  }).then(function() {
    console.log("Added friend");
  });

}

function loadUserData() {
  console.log("loading User data");
  db.collection("users").doc(uid).get().then(function(userData) {
    //If the user data exists load the user data
    if (userData.exists) {
      //Check to see if they have a bio and if not direct them to the welcome page
      if (userData.get("bio") && userData.get("tagline")) {
        console.log("the user has a bio and a tagline");
        //check to see if the user has selected a valid school

        //store the user data in an object
        var profilePic = "";
        var profilePictureRef = storageRef.child('profile-pictures').child(uid);

        // Get the download URL for profile pic//// TODO: Put this in userData
        profilePictureRef.getDownloadURL().then(function(url) {
          profilePic = url;
        }).catch(function(error) {
          profilePic = "https://www.keypointintelligence.com/img/anonymous.png";
        }).then(function() {

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
            chats: userData.get("chatrooms"),
            freinds: userData.get("freinds"),
            profilePic: profilePic, //// TODO: Load that here
          };
          if (userData.get("school")) {
            loadMainPage();
            //self.app.views.main.router.once('pageAfterIn', loadMainPage());
            //self.app.views.main.router.navigate('/home/', {});
          } else {
            //Go to the school selection page
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

//THis replaces editUserData as it is robust
function setUsersData(bio, tag, pic, password) {

  //If the bio is not emty set it here
  if (bio) {
    console.log("updating user bio");
    db.collection("users").doc(uid).update({
      bio: bio
    });
  }
  //if the tagline is not empty set it here
  if (tag) {
    db.collection("users").doc(uid).update({
      tagline: tag
    });
  }
  //if the pic is not empty setit here
  if (pic) {

  }
  //if the password is not emty set it there
  if (password) {
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
  }).then(function() {
    app.progressbar.hide();
    self.app.views.main.router.navigate('/home/');

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