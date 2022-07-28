/**
 * Returns time in format '2022-07-28 20:34:15'.
 * @param {Date} time Datetime to be formatted.
 * @returns Formatted datetime.
 */
function getFormattedTime(time) {
  /** '2022-07-28T20:34:15.000Z' to '2022-07-28 20:34:15' */
  let newTime = new Date(time.getTime()).toISOString().split('.')[0].replace('T', ' ')

  return newTime
}

module.exports = getFormattedTime