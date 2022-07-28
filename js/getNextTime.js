let { delta } = require('./configs')

/**
 * Adds *delta* minutes to the date.
 * @param {Date} time Date to increased.
 * @returns Increased date.
 */
function getNextTime(time) {
  let newTime = new Date(time.getTime() + delta * 60000)

  return newTime
}

module.exports = getNextTime