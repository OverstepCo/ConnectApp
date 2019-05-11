///////Events//////
function loadSchoolEvents() {
  db.collection("school").doc(User.school).collection("event").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      //this loop runs once for every event in the current school
      addEventToPage(doc.get("name"), doc.get("image"), doc.get("day"), doc.get("time"), doc.get("location"), doc.get("description"), doc.get("guests"));
    });
  });

}

function addNewEvent() { //Gets the data we need from the ui and posts it to the server may eventually merrge this with addSchoolEvent()

  var name = document.getElementById("newEventName").value;
  var imageUrl = "media/stock/event_pattern.jpg"; //TODO get this from the new event page
  var day = document.getElementById("newEventDay").value;
  var time = document.getElementById("newEventTime").value;
  var location = document.getElementById("newEventLocation").value;
  var description = document.getElementById("newEventDescription").value;
  var guests = null; //TODO store on server as an array
  addSchoolEvent(name, imageUrl, day, time, location, description, guests);

}

function addSchoolEvent(name, image, day, time, location, description, guests) { //Adds a event to the school database with the provided data
  db.collection("school").doc(User.school).collection("event").add({
    name: name,
    image,
    day,
    time,
    location,
    description,
    guests,
    owner: User.uid
  }).then(function() {
    console.log("Added a new event to the server");
  });
}

function addEventToPage(name, image, day, time, location, description, guests) { //Adds an event to the local UI.
  app.swiper.destroy('.swiper-container');
  var swiper = document.getElementById('event-swiper');
  var event = document.createElement('div');
  event.classList.add("swiper-slide");
  event.innerHTML = '<div class="slide-content">\
      <div class="row" style="margin-bottom: 0">\
        <div class="col-33">\
          <div class="slide-image" style="background-image: url(' + image + ');"></div>\
            </div>\
              <div class="col-66">\
                <div class="slide-text">\
                  <h4 class="slide-title">' + name + '</h4>\
                    <p>' + day + '</p>\
                      <p>' + time + ' | ' + location + '</p>\
                        </div>\
                          </div>\
                            </div>\
                              <div class="collapsible">\
                              <div class="collapsible-content">' + description + '</div>\
                              <div style="background-color: white">\
                            <div class="hairline"></div>\
                          </div>\
                        </div>\
                      <div class=" row slide-guests">\
                    <div class="row left" style="display:flex;justify-content: center;align-items: center;">\
                  <div class="col img" style="background-image: url(https://cdn.mos.cms.futurecdn.net/Rmtq8KDLagPDutJTp5ZViE.jpg)"></div>\
                <div class="col img" style="background-image: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyMQl7f1VtadBUijAqRzqzM0KG0cYEoA5aXeqLmuzUQUJENZHN5A)"></div>\
              <p>+3 more</p>\
            </div>\
          <div class="right"><a class="link collapsible-toggle"><i class="material-icons">expand_more</i></a></div>\
        </div>\
      </div>';

  swiper.appendChild(event);
  app.swiper.create('.swiper-container');

  var collToggle = document.getElementsByClassName("collapsible-toggle");

  collToggle[collToggle.length - 1].addEventListener("click", function() {
    this.classList.toggle("active");
    var coll = this.parentElement.parentElement.previousElementSibling;
    coll.classList.toggle("expanded");
  });
  updateSwiper();

}

function createNewEvent() {
  var name = document.getElementById("event-name").value;
  var day = document.getElementById("event-day").value;
  var time = document.getElementById("event-time").value;
  var location = document.getElementById("event-location").value;
  var description = document.getElementById("event-description").value;
  var image = document.getElementById("event-image"),
    style = image.currentStyle || window.getComputedStyle(image, false),
    bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
  addSchoolEvent(name, bi, day, time, location, description, '');
  addEventToPage(name, bi, day, time, location, description, '');

}
////////////////