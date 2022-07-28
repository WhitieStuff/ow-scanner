const fs = require('fs')
const getFormattedTime = require('./getFormattedTime')

/**
 * Logs given data to console or a file.
 * @param {string} data Data to be logged.
 */
function log(data) {
  /** Formatted time. */
  let now = getFormattedTime(new Date())
  /** Forrmatted data. */
  let entry = `${now}: ${data.toString()}\n---\n`
  /** Name of the log file. */
  let logFile = `./log.txt`
  
  // Log to console.
  console.log(entry)

  fs.appendFile(logFile, entry, function (err) {
    if (err) return console.log(err)
  })
}

module.exports = log
