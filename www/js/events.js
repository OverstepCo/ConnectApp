///////Events//////


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
  var swiper = document.getElementById('event-swiper');
  var event = document.createElement('div');
  event.classList.add("swiper-slide");
  event.innerHTML = '<div class="slide-content" onclick="openCard()"><div>' +
        '<h1>' + name + '</h1>' +
        '<p>Friday, March 20</p>' +
      '</div></div>';

  swiper.appendChild(event);
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

function openCard() {
  document.getElementById("expandable-card").style.display = "inherit";
}
////////////////
