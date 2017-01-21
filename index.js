const komada = require('komada');
const token = require('./config.json').token;

komada.start({
  "botToken": token,
  "ownerID" : "116293018742554625",
  "clientID": "272419982619705346",
  "prefix": "<@272419982619705346> ",
  "cmdPrompt": true,
  "disabledCommands": ["ping"],
  "clientOptions": {
    "fetchAllMembers": true
  }
})
