const cookieParser = require('cookie-parser');
const path         = require('path');
const express      = require('express');
const logger       = require('morgan');
const http         = require('http');
const cors         = require('cors')
const app          = express();


const router     = require('./routes');
const publicPath = path.join(__dirname, 'public');
const port       = process.env.PORT || '3000';
const server     = http.createServer(app);

const db         = require('./mongoose.js');

// Set up connection of db
db.setUpConnection();

app.use(cors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicPath));

app.use('/api', router);

app.set('port', port);

server.listen(port, () => {
    console.info(`Server has started on port: ${port}`);
});
