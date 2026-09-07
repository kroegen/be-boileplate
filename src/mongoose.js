const mongoose = require('mongoose');
const config   = require('./bin/config.json');

require('./models/Comment.js');
require('./models/User.js');
require('./models/Post.js');

mongoose.Promise = global.Promise;

const defaultUri = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;

mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
});

const setUpConnection = (uri) => {
    console.log(`MongoDB config: ${JSON.stringify(config)}`);
    return mongoose.connect(uri || defaultUri, { useNewUrlParser: true }).catch((err) => {
        console.error(`MongoDB connection failed: ${err.message}`);
        process.exit(1);
    });
}

module.exports = {
    mongoose,
    setUpConnection
};
