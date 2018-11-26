const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

//console.log(ipfs)
ipfs.util.addFromFs('/root/shoutao/dd/20180927', { recursive: true, ignore: [] }, (err, result) => {
  if (err) { throw err }
  console.log(result)
});