const http = require('http');
const app  = require('./app');
const db   = require('./mongoose.js');

const port   = process.env.PORT || '3000';
const server = http.createServer(app);

app.set('port', port);

const startServer = async () => {
    try {
        await db.setUpConnection();
        server.listen(port, () => {
            console.info(`Server has started on port: ${port}`);
        });
    } catch (err) {
        console.error(`Failed to start server: ${err.message}`);
        process.exit(1);
    }
};

startServer();
