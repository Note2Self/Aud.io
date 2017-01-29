module.exports = (guilds) => {
  require('unirest').post('https://bots.discord.pw/api/bots/272419982619705346/stats')
  .headers({
    'Content-Type': 'application/json',
    'Authorization': require(`./config.json`).dbots
  })
  .send({'server_count': guilds})
  .end(res => {})
}
