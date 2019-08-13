const users = require('../services/users');

module.exports = {
    create : users.createUser,
    list   : users.getUsers,
}
