import { mongoose } from '#src/mongoose.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      index: { unique: true },
    },
    passwordHash: {
      type: String,
      default: '',
    },
    salt: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'BLOCKED', 'PENDING'],
      default: 'ACTIVE',
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

UserSchema.virtual('password').set(function setHash(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.passwordHash = this.encryptPassword(password);
});

UserSchema.methods = {
  checkPassword(plainText) {
    return this.encryptPassword(plainText) === this.passwordHash;
  },

  makeSalt() {
    return `${Math.round(new Date().valueOf() * Math.random())}`;
  },

  encryptPassword(password) {
    try {
      return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    } catch (_err) {
      return '';
    }
  },
};

export default mongoose.model('UserModel', UserSchema);
