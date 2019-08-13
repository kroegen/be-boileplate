const mongoose = require('mongoose');
const config   = require('./bin/config.json');

require('./models/Comment.js');
require('./models/User.js');
require('./models/Post.js');

mongoose.Promise = global.Promise;

const setUpConnection = () => {
    console.log(`MongoDB config: ${JSON.stringify(config)}`);
    mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
}

module.exports = {
    mongoose,
    setUpConnection
};
