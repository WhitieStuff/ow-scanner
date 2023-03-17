const fs = require('fs')
const { exec } = require('child_process')

/** Initial search start time. */
let initial_time = new Date('2023-03-17T00:00:00.000+00:00')
/** Time delta in minutes. */
let delta = 15
/** Current node. */
let node = 2
/** Current client API ID. */
let api = 2130
/** Output file name. */
let output = 'output'
/** Whether to split output by days. */
let split = true
/** Query
 * ! __DATE__ will be replaced with e.g. 230312.
 * ! __FROM__ will be replaced with a datetime.
 * ! __TO__ will be replaced with a datetime.
 */
let query = `
select
    req_id,
    api_id,
    json_extract(req_request, '$.config.brand.id') brand_id,
    json_extract(req_request, '$.config.brand.skin') skin_id,
    req_datetime_short,
    req_request,
    req_response
    req_status
  from
    (
      select
        *,
        mid(req_data, locate('{', req_data), length(req_data)) req_request,
        mid(req_datetime, 1, 19) req_datetime_short
      from
        MerchantRequestsNew__DATE__
      where
        req_system_id=892
        and req_datetime between '__FROM__' and '__TO__'
        and req_data like '%testtest%'
    ) t1;
`

class Scanner {
  /** Public key for SSH if needed. */
  key = ''
  /** SSH host. */
  host = 'test.example.org'
  /** Connection parameters. */
  nodes = {
    1: {
      user: 'dblog4',
      db: 'funprod'
    },
    2: {
      user: 'db2log4',
      db: 'funprod2'
    },
    3: {
      user: 'db3log1',
      db: 'funprod3'
    }
  }

  start_time = null
  start_time_formatted = null
  end_time = null
  end_time_formatted = null

  constructor(params = {}) {
    this.start_time = params.initial_time
    if (!this.start_time) return this.log('Initial time not provided')

    this.delta = params.delta
    if (!this.delta) return this.log('Delta not provided')

    this.node = params.node
    if (!this.node) return this.log('Node not provided')

    this.api = params.api
    if (!this.api) return this.log('API not provided')

    this.output = params.output
    if (!this.output) return this.log('Output file name not provided')

    this.output = params.output
    if (!this.output) return this.log('Output file name not provided')

    this.query = params.query
    if (!this.query) return this.log('Query not provided')

    this.split = params.split ? params.split : false

    this.prepareNextQuery()
  }

  /**
   * Prepares the query and run its execution.
   */
  async prepareNextQuery() {
    let query = this.createQuery()

    let performed = await this.executeQuery(query)
    if (performed) this.shiftTime()

    return this.prepareNextQuery()
  }

  /**
   * Creates the SQL query.
   * @param {Date} timeStart Seach from.
   * @returns SQL query to be executed.
   */
  createQuery() {
    /** Search until. */
    this.end_time = this.getNextTime(this.start_time)
    /** Formatted 'search from' time. */
    this.start_time_formatted = this.getFormattedTime(this.start_time)
    /** Formatted 'search until' time. */
    this.end_time_formatted = this.getFormattedTime(this.end_time)
    /** Table name postfix. */
    this.table_date = this.getTableDate(this.start_time_formatted)

    /** SQL Query. All double quotes " must be double-escaped with \`".
     * First one for the powershell and the second one is for SQL.
     */
    let query = this.query.replace('__DATE__', this.table_date).replace('__FROM__', this.start_time_formatted).replace('__TO__', this.end_time_formatted).replace(/"/g, '`"')

    return query
  }

  shiftTime() {
    this.start_time = this.end_time
    this.start_time_formatted = this.end_time_formatted
    this.log(`Searched up to ${this.start_time_formatted}`)
  }

  /**
   * Executes the query in powershell via SSH.
   * @param {string} query Query to be executed.
   * @returns Result status. True if executed.
   */
  async executeQuery(query) {
    /** SSH connection command. */
    let ssh = `ssh ${this.key ? `-i ${this.key}` : ''} -T ${this.nodes[this.node].user}@${this.host}`
    
    let new_output = this.split ? `${this.output}_${this.table_date}.csv` : `${this.output}.csv` 
    
    /** Command to be run in powershell. */
    let command = `echo "use ${this.nodes[this.node].db}; ${query}" | ${ssh} >> ${new_output}`
    this.log(`The following command will be executed: \n${command}`)

    let result = ''

    try {
      const { stdout, stderr } = await exec(command, { shell: 'powershell.exe' })

      var performed = new Promise((resolve, reject) => {
        stderr.on('data', function (data) {
          result = `Error: ${data}`
          reject(false)
        })
        stdout.on('data', function (data) {
          result = `Output: ${data}`
          resolve(true)
        })
        stdout.on('close', () => {
          resolve(true)
        })
      })

      this.log(result)
      this.log(`Query performed: ${await performed}`)
    } catch (e) {
      this.log(`Error: ${e}`)
    }

    return performed
  }

  /**
   *
   * ===== SERVICE FUNTIONS =====
   *
   */

  /**
   * Returns time in format '2022-07-28 20:34:15'.
   * @param {date} time Datetime to be formatted.
   * @returns {string} Formatted datetime.
   */
  getFormattedTime(datetime) {
    // '2022-07-28T20:34:15.000Z' to '2022-07-28 20:34:15'
    let new_time = new Date(datetime.getTime()).toISOString().split('.')[0].replace('T', ' ')

    return new_time
  }

  /**
   * Adds *delta* minutes to the date.
   * @param {Date} time Date to increased.
   * @returns Increased date.
   */
  getNextTime(datetime) {
    let new_time = new Date(datetime.getTime() + this.delta * 60000)

    return new_time
  }

  /**
   * Returns date in format '220728'.
   * @param {date} date Date to be formatted.
   * @returns Formatted date.
   */
  getTableDate(datetime) {
    let year = new Date(datetime).getYear() + 1900
    let year_formatted = year.toString().substring(2, 4)
    let month = new Date(datetime).getMonth() + 1
    let month_formatted = month.toString().padStart(2, '0')
    let day = new Date(datetime).getDate()
    let day_formatted = day.toString().padStart(2, '0')

    let date_formatted = `${year_formatted}${month_formatted}${day_formatted}`
    return date_formatted
  }

  /**
   * Logs given data to console or a file.
   * @param {string} data Data to be logged.
   */
  log(data) {
    let now = this.getFormattedTime(new Date())

    let entry = `${now}: ${data.toString()}\n---\n`

    let logFile = `./log.txt`

    console.log(entry)

    fs.appendFile(logFile, entry, function (err) {
      if (err) return console.log(err)
    })
  }
}

let scanner = new Scanner({initial_time, delta, node, api, output, split, query})