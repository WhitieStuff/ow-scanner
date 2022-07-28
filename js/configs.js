/** Current client API ID. */
let api = 1234
/** Current node. */
let nodeNo = 1

/** Initial search start time. */
let initialTime = new Date('2022-07-01T00:00:00.000+00:00')
/** Time delta in minutes. */
delta = 15

/** Connection parameters. */
let nodes = {
  1: {
    node: 1,
    user: 'dblog4',
    db: 'funprod'
  },
  2: {
    node: 2,
    user: 'db2log4',
    db: 'funprod2'
  },
  3: {
    node: 3,
    user: 'db3log1',
    db: 'funprod3'
  }
}
/** Current connection parameters. */
let node = nodes[nodeNo]

/** Public key for SSH if needed. */
let key = './id'
key = ''
/** SSH host. */
let host = 'example.com'
/** SSH connection command. */
let ssh = `ssh ${key ? `-i ${key}` : ''} -T ${node.user}@${host}`

/**
 * Output source. Postfix may be injected by *execute.js*, so it must contain only one dot before the file extension.
 * If empty, console output will be applied.
 */
let output = '>> output.csv'

module.exports = { api, node, ssh, output, initialTime, delta }
