module.exports = (guilds) => {
  require('unirest').post('https://bots.discord.pw/api/bots/272419982619705346/stats')
  .headers({
    'Content-Type': 'application/json',
    'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIxMTYyOTMwMTg3NDI1NTQ2MjUiLCJyYW5kIjo4OTgsImlhdCI6MTQ3MDg2MDU5OH0.ZLWQOD3BXq4BdpyXPxH8BfvOk5NWaedhsKiCilFbTxc'
  })
  .send({'server_count': guilds})
  .end(res => {})
}
