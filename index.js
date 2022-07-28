const fs = require('fs')
const execute = require('./js/execute')
const createQuery = require('./js/createQuery')
const { initialTime } = require('./js/configs')
const getTimeFormatted = require('./js/getFormattedTime')
const getNextTime = require('./js/getNextTime')
const getTableDate = require('./js/getTableDate')
const log = require('./js/log')

let timeNext = initialTime

/**
 * Change configs.js first.
 */

async function prepareNextQuery(time) {
  let query = createQuery(timeNext)
  let timeNextFormatted = getTimeFormatted(timeNext)
  let output_postfix = getTableDate(timeNextFormatted)

  let performed = await execute(query, output_postfix)
  if (performed) shiftTime()

  return prepareNextQuery(timeNext)
}

function shiftTime() {
  timeNext = getNextTime(timeNext)
  let timeNextFormatted = getTimeFormatted(timeNext)
  log(`Searched up to ${timeNextFormatted}`)
  fs.writeFile('./lastTime.txt', timeNextFormatted, function (err) {
    if (err) return console.log(err)
  })
}

prepareNextQuery(timeNext)
