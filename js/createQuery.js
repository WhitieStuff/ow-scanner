/** API ID set in configs.js */
let { api } = require('./configs')
// const log = require('./log')
const getTimeFormatted = require('./getFormattedTime')
const getNextTime = require('./getNextTime')
const getTableDate = require('./getTableDate')

/**
 * Creates the SQL query.
 * @param {Date} timeStart Seach from.
 * @returns SQL query to be executed.
 */
function createQuery(timeStart) {
  /** Search until. */
  let timeEnd = getNextTime(timeStart)
  /** Formatted 'search from' time. */
  let timeStartFormatted = getTimeFormatted(timeStart)
  /** Formatted 'search until' time. */
  let timeEndFormatted = getTimeFormatted(timeEnd)
  /** Table name postfix. */
  let date = getTableDate(timeStartFormatted)

  /** SQL Query. All double quotes " must be double-escaped with \`".
   * First one for the powershell and the second one is for SQL.
   */
  let query = `
  select 
    req_id ID, 
    req_parent_id 'Parent ID',
    api_id 'API ID',
    req_datetime DateTime, 
    req_status Status, 
    substring(substring_index(req_data,'\`",\`"',1), locate('\`":\`"',substring_index(req_data,'\`",\`"',1)) + 3, 10) Type, 
    substring_index(req_data, ' ', -1) Request, 
    req_response Response 
  from 
    MerchantRequestsNew${date} 
  where 
    req_system_id=100 
    and api_id=${api} 
    and req_datetime between '${timeStartFormatted}' and '${timeEndFormatted}' 
    and req_response regexp '\`"balance\`":\`"-[0-9|.]+\`"';`
  return query
}

module.exports = createQuery
