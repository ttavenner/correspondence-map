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
    if (!isNaN(parseFloat(l.senderLat)) && !isNaN(parseFloat(l.senderLng))) {
      l.sentPoint = L.latLng(parseFloat(l.senderLat), parseFloat(l.senderLng))
    }
    if (!isNaN(parseFloat(l.receiverLat)) && !isNaN(parseFloat(l.receiverLng))) {
      l.receivedPoint = L.latLng(parseFloat(l.receiverLat), parseFloat(l.receiverLng))
    }

    if (!isNaN(parseFloat(l.senderLat)) && !isNaN(parseFloat(l.senderLng))
        && !isNaN(parseFloat(l.receiverLat)) && !isNaN(parseFloat(l.receiverLng))) {
      l.line = L.polyline([[parseFloat(l.senderLat),parseFloat(l.senderLng)],
                        [parseFloat(l.receiverLat),parseFloat(l.receiverLng)]])

      l.lineName = l.sentLocation + ' to ' + l.receivedLocation
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
