const http = require('http');
const app  = require('./app');
const db   = require('./mongoose.js');

const port   = process.env.PORT || '3000';
const server = http.createServer(app);

// Set up connection of db
db.setUpConnection();

app.set('port', port);

server.listen(port, () => {
    console.info(`Server has started on port: ${port}`);
});
