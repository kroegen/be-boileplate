#!/usr/bin/env node
const { mongoose } = require('../mongoose.js');
const db           = require('../mongoose.js');
const { docopt }   = require('docopt');

const startCli = async () => {
    await db.setUpConnection(process.env.MONGODB_URI);

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

    try {
        if (opts['--drop']) {
            await mongoose.connection.collections.users.drop();
        }

        await user.save();
        console.log('Success!', user);
    } catch (err) {
        console.error(err.message);
    } finally {
        await mongoose.connection.close();
    }
};

startCli();
