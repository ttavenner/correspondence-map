'use strict'
/*
* Load Data
*/

var data = (() => {
  // Set some sensible boundaries for years
  var minYearDefault = 1799
  var maxYearDefault = 1899


  // Load letter data into an array of objects
  var file = $.ajax({
      url: "letters.csv",
      async: false
  }).responseText
  var fileObj = $.csv.toObjects(file)

  /*
  * Cleanse Data
  */

  // Convert latitudes, longitudes, and dates into useful objects
  // and add to the array
  var rows = fileObj.map((l) => {
    if (!isNaN(parseFloat(l.sender_lat)) && !isNaN(parseFloat(l.sender_lng))) {
      l.sent_point = L.latLng(parseFloat(l.sender_lat), parseFloat(l.sender_lng))
    }
    if (!isNaN(parseFloat(l.receiver_lat)) && !isNaN(parseFloat(l.receiver_lng))) {
      l.receive_point = L.latLng(parseFloat(l.receiver_lat), parseFloat(l.receiver_lng))
    }

    if (!isNaN(parseFloat(l.sender_lat)) && !isNaN(parseFloat(l.sender_lng))
        && !isNaN(parseFloat(l.receiver_lat)) && !isNaN(parseFloat(l.receiver_lng))) {
      l.line = L.polyline([[parseFloat(l.sender_lat),parseFloat(l.sender_lng)],
                        [parseFloat(l.receiver_lat),parseFloat(l.receiver_lng)]])

      l.line_name = l.sentlocation + ' to ' + l.receivedlocation
    }

    l.cleanDate = isNaN(Date.parse(l.date)) ? NaN : new Date(l.date)

    return l
  })


  // Calculate minimum and maximum years
  var minYear = rows.reduce((p, c) => {
      if (!isNaN(c.cleanDate) && c.cleanDate.getFullYear() > minYearDefault) {
        return Math.min(p, c.cleanDate.getFullYear())
      }
      else {
        return p
      }
  },maxYearDefault)

  var maxYear = rows.reduce((p, c) => {
      if (!isNaN(c.cleanDate) && c.cleanDate.getFullYear() < maxYearDefault) {
        return Math.max(p, c.cleanDate.getFullYear())
      }
      else {
        return p
      }
  },minYearDefault)


  // Make sure min and max year are within our default range
  minYear = Math.max(minYear,minYearDefault)
  maxYear = Math.min(maxYear, maxYearDefault)

  return {
    rows: rows,
    minYear: minYear,
    maxYear: maxYear
  }
})()
