const { exec } = require('child_process')
const { ssh, output, node } = require('./configs')
const log = require('./log')

/**
 * Executes the query in powershell via SSH.
 * @param {string} query Query to be executed.
 * @param {string} output_postfix Postfix to be added before the output file extension.
 * @returns Result status. True if executed.
 */
async function execute(query, output_postfix) {
  /** Output file with the provided postfix. Remains empty if not set in *configs.js.* */
  let newOutput = output && output_postfix ? `${output.split('.')[0]}_${output_postfix}.csv` : output || ''
  /** Command to be run in powershell. */
  let command = `echo "use funprod${node.node > 1 ? node.node : ''}; ${query}" | ${ssh} ${newOutput}`
  log(`The following command will be executed: \n${command}`)

  try {
    const { stdout, stderr } = await exec(command, { shell: 'powershell.exe' })

    var performed = new Promise((resolve, reject) => {
      stderr.on('data', function (data) {
        log(`Error: ${data}`)
        reject(false)
      })
      stdout.on('data', function (data) {
        log(`Output: ${data}`)
        resolve(true)
      })
      stdout.on('close', () => {
        resolve(true)
      })
    })

    log(`Query performed: ${await performed}`)
  } catch (e) {
    log(`Error: ${e}`)
  }

  return performed
}

module.exports = execute
