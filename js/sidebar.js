'use strict'

/*
* Sidebar Functions
* Display detailed letter information in the sidebar
*/

var sidebar = (() => {
  // Turn sidebar on/off depending on current state
  function toggleInfo(action) {
      var sidebar = $('#sidebar')
      var sidebarWidth = sidebar.width()

      if (action == 'open' && !sidebar.hasClass('open')) {
          sidebar.toggleClass('open')
          sidebar.animate({right: 0})
      }
      if (action == 'close' && sidebar.hasClass('open')) {
          sidebar.toggleClass('open')
          sidebar.animate({
              right: -sidebarWidth
          }, 250)
          $('#info').html("")
      }
  }


  // Generate detailed text for letter info and display in sidebar
  function getLetters(evt) {
      var sentLocation = evt.target.type == "place" ? evt.target.name : evt.target.name.split(" to ")[0]
      var receivedLocation = evt.target.type == "place" ? evt.target.name : evt.target.name.split(" to ")[1]
      var text = ""

      if (evt.target.type == "place") {
        text = data.rows.reduce((p, c) => {
          if (c.sentLocation == sentLocation || c.receivedLocation == receivedLocation) {

            return p + "<p class='letter'>" +
            "From: " + c.sender + "<br />" +
            "To: " + c.recipient + "<br />" +
            "Date: " + c.date + "<br />" +
            c.title + "<br />" +
            "<a href='" + c.link + "'>Original Document</a>" +
            "</p>"
          }
          else {
            return p
          }
        },"")
      }

      if (evt.target.type == "line") {
          text = data.rows.reduce((p, c) => {
              if (c.sentLocation == sentLocation && c.receivedLocation == receivedLocation) {
                return p + "<p class='letter'>" +
                "From: " + c.sender + "<br />" +
                "To: " + c.recipient + "<br />" +
                "Date: " + c.date + "<br />" +
                c.title + "<br />" +
                "<a href='" + c.link + "'>Original Document</a>" +
                "</p>"
              }
              else {
                return p
              }
          },"")
      }

      document.getElementById("info").innerHTML = text
      toggleInfo('open')
  }

  return {
    toggleInfo: toggleInfo,
    getLetters: getLetters,
  }
})()
