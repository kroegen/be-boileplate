#!/usr/bin/env node
import { mongoose, setUpConnection, disconnect } from '../mongoose.js';

const startCli = async () => {
  await setUpConnection(process.env.MONGODB_URI);

  const User = mongoose.model('UserModel');
  
  // Parse command line arguments manually
  const args = process.argv.slice(2);
  const opts = {
    help: false,
    email: null,
    password: null,
    name: 'Admin',
    role: null,
    company: 'default',
    drop: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-h' || arg === '--help') {
      opts.help = true;
      continue;
    }
    
    if (arg.startsWith('--email=')) {
      opts.email = arg.substring('--email='.length);
    } else if (arg.startsWith('--password=')) {
      opts.password = arg.substring('--password='.length);
    } else if (arg.startsWith('--name=')) {
      opts.name = arg.substring('--name='.length);
    } else if (arg.startsWith('--role=')) {
      opts.role = arg.substring('--role='.length);
    } else if (arg.startsWith('--company=')) {
      opts.company = arg.substring('--company='.length);
    } else if (arg === '-d' || arg === '--drop') {
      opts.drop = true;
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
      '   -c --company <name>       New user company [default: default].',
      '   -d --drop                 Drop database first.',
      '',
    ].join('\n');
    
    console.log(helpText);
    
    if (!opts.email || !opts.password) {
      await disconnect();
      process.exit(1);
    }
  }

  const user = new User({
    status: 'ACTIVE',
    role: opts.role,
    name: opts.name,
    email: opts.email,
    password: opts.password,
  });

  try {
    if (opts.drop) {
      await mongoose.connection.collections.users.drop();
    }

    await user.save();
    console.log('Success!', user);
  } catch (err) {
    console.error(err.message);
  } finally {
    await disconnect();
  }
};

startCli();
