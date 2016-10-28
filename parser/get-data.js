var fs = require('fs')
var qs = require('qs')
var request = require('request')
var csvWriter = require('csv-write-stream')

var config = require('./config.json')

var headers = ['dplaLink', 'link', 'title', 'sender', 'recipient',
               'year', 'description', 'place', 'date']

var writer = csvWriter({headers: headers})
writer.pipe(fs.createWriteStream('letters.csv'))


// Set our API query parameters
var baseUrl = 'http://api.dp.la/v2/items?'
var queryString = {
  api_key: config.api_key,
  sourceResource: {
    subject: {
      name: 'Maria Chapman'
    }
  },
  page_size: 500,
  page: 1
}

getData()


function getData() {
  // Build the URL string and set options for the request
  var options = {
    url: baseUrl + qs.stringify(queryString, {allowDots: true}),
    json: true
  }

  // Request data from the API
  request(options, (err, res, records) => {
    if (!err && res.statusCode == 200) {
      records.docs.map((l) => {

        letter = {dplaLink: l.hasOwnProperty('@id') ? l['@id'] : l.object['@id']}

        // Metadata contains most of the information we want, but isn't always present
        if (l.originalRecord.hasOwnProperty('metadata')) {

            letter.title = l.originalRecord.metadata.title
            letter.year = l.originalRecord.metadata.date
            letter.link = l.originalRecord.metadata['identifier-access']

            if (l.originalRecord.metadata.hasOwnProperty('creator')) {

              // If creator is a list of names, search for sender and recipient
              if(typeof l.originalRecord.metadata.creator == 'object') {
                letter.recipient = l.originalRecord.metadata.creator.reduce((p, c)=> {
                  return c.endsWith('recipient') ? c.replace(/,*\s*(recipient)$/,'') : p
                }, '')

                letter.sender = l.originalRecord.metadata.creator.reduce((p, c)=> {
                  return c.endsWith('recipient') ? p: c
                }, '')
              }
              // If creator isn't a list of names then it is a single string
              // Check if it lists the sender or recipient and assign as appropriate
              else {
                letter.recipient = l.originalRecord.metadata.creator.endsWith('recipient') ? l.originalRecord.metadata.creator.replace(/,*\s*(recipient)$/,'') : null
                letter.sender = l.originalRecord.metadata.creator.endsWith('recipient') ? null : l.originalRecord.metadata.creator
              }
            }

            if (l.originalRecord.metadata.hasOwnProperty('description')) {
              if(typeof l.originalRecord.metadata.description == 'object') {
                letter.description = l.originalRecord.metadata.description.reduce((p, c)=>{ return p += c + '.'},'')
              }
              else { letter.description = l.originalRecord.metadata.description }
            }
        }

        if (l.originalRecord.hasOwnProperty('record')) {
          letter.place = l.originalRecord.record.datafield.reduce((p, c) => {
            if (c.tag == '260') {
              if (Array.isArray(c.subfield)) {
                return c.subfield.reduce((a, b)=>{ return b.code == 'a' ? b['#text'] : a }, '')
              }
              else {
                return c.subfield.code == 'a' ? c.subfield['#text'] : p
              }
            }

            return p
          }, '')

          letter.date = l.originalRecord.record.datafield.reduce((p, c) => {
            if (c.tag == '260') {
              if (Array.isArray(c.subfield)) {
                return c.subfield.reduce((a, b)=>{ return b.code == 'c' ? b['#text'] : a }, '')
              }
              else {
                return c.subfield.code == 'c' ? c.subfield['#text'] : p
              }
            }

            return p
          }, '')
        }
        writer.write(letter)
      })

      console.log("Grabbed " + Math.min(records.count, (records.start + records.limit)) + " of " + records.count + " records")

      if ((records.start + records.limit) < records.count) {
        queryString.page++
        getData()
      }
      else {
        writer.end()
      }
    }
  })
}
