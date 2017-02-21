module.exports = info => {
  require('superagent').post('https://bots.discord.pw/api/bots/187406062989606912/stats')
    .set({ 'Content-Type': 'application/json', 'Authorization': info.auth })
    .send({ 'server_count': info.count }).end((err, res) => {
      if (!err) console.log('SUCCESSFUL ABAL UPDATE', count);
    });
}
