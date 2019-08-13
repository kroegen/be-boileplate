#!/usr/bin/env node
const { mongoose } = require('../mongoose.js');
const db           = require('../mongoose.js');
const { docopt }   = require('docopt');

const User = mongoose.model('UserModel');
const doc  = [
    'Usage:',
    '   add_user.js --email=<email> --password=<password> [--name=<name>] [--role=<role>] [--drop]',
    '   add_user.js -h | --help',
    '',
    'Options:',
    '   -h --help                 Show this screen.',
    '   -l --email <email>        Login for new user.',
    '   -p --password <password>  Password for new user.',
    '   -r --role <role>          Role for new user.',
    '   -n --name <name>          New user name [default: Admin].',
    '   -c --company <name>       New user company [default: default].',
    '   -d --drop                 Drop database first.',
    ''
].join('\n');

const opts = docopt(doc);
const user = new User({
    status:   'ACTIVE',
    role:     opts['--role'],
    name:     opts['--name'],
    email:    opts['--email'] ? opts['--email'] : 'admin@mail.com',
    password: opts['--password']
});

db.setUpConnection();

new Promise((resolve, reject) => {
    if (opts['--drop']) {
        return mongoose.connection.collections.users.drop((err) => {
            if (err) return reject(err);

            resolve();
        });
    }

    return resolve();
}).then(() => user.save()).then(() => {
    console.log('Success!', user);
    mongoose.connection.close();
}).catch(err => {
    console.error(err);
    mongoose.connection.close();
});
