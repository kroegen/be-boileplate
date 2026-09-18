#!/usr/bin/env node
/* eslint-disable no-console */
import { mongoose, setUpConnection, disconnect } from '#src/mongoose.js';
import { getMongoDbUri } from '#src/config/index.js';

const startCli = async () => {
  // Parse command line arguments manually
  const args = process.argv.slice(2);
  const opts = {
    help: false,
    email: null,
    password: null,
    name: 'Admin',
    role: undefined,
    drop: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      opts.help = true;
      continue;
    }

    if (arg === '-l' || arg === '--email') {
      opts.email = args[++i];
    } else if (arg === '-p' || arg === '--password') {
      opts.password = args[++i];
    } else if (arg === '-n' || arg === '--name') {
      opts.name = args[++i];
    } else if (arg === '-r' || arg === '--role') {
      opts.role = args[++i];
    } else if (arg === '-d' || arg === '--drop') {
      opts.drop = true;
    } else if (arg.startsWith('--email=')) {
      opts.email = arg.substring('--email='.length);
    } else if (arg.startsWith('--password=')) {
      opts.password = arg.substring('--password='.length);
    } else if (arg.startsWith('--name=')) {
      opts.name = arg.substring('--name='.length);
    } else if (arg.startsWith('--role=')) {
      opts.role = arg.substring('--role='.length);
    }
  }

  // Show help if requested or if required args are missing
  if (opts.help || !opts.email || !opts.password) {
    const helpText = [
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
      '   -d --drop                 Drop users collection first.',
      '',
    ].join('\n');

    console.log(helpText);

    process.exit(1);
  }

  await setUpConnection(getMongoDbUri());

  const User = mongoose.model('UserModel');

  const user = new User({
    status: 'ACTIVE',
    role: opts.role,
    name: opts.name,
    email: opts.email,
    password: opts.password,
  });

  try {
    if (opts.drop) {
      await mongoose.connection.dropDatabase();
    }

    await user.save();
    console.log('Success!', user);
  } catch (err) {
    console.error(err.message);
    await disconnect();
    process.exit(1);
  } finally {
    await disconnect();
  }
};

startCli();
