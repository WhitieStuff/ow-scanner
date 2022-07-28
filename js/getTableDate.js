/**
 * Returns date in format '220728'.
 * @param {date} date Date to be formatted.
 * @returns Formatted date.
 */
function getTableDate(date) {
  let year = new Date(date).getYear() + 1900
  let yearFormatted = year.toString().substring(2, 4)
  let month = new Date(date).getMonth() + 1
  let monthFormatted = month.toString().padStart(2,'0')
  let day = new Date(date).getDate()
  let dayFormatted = day.toString().padStart(2,'0')
  
  let dateFormatted= `${yearFormatted}${monthFormatted}${dayFormatted}`
  return dateFormatted
}

module.exports = getTableDate