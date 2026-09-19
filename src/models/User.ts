import { mongoose, Schema } from '#src/mongoose.js';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, verifyPassword } from '#src/utils/auth.js';

const UserSchema = new Schema(
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

UserSchema.virtual('password').set(function setHash(this: { $locals: { password?: string } }, password: string) {
  this.$locals.password = password;
});

UserSchema.methods = {
  async checkPassword(plainText: string): Promise<boolean> {
    return verifyPassword(plainText, this.passwordHash);
  },
};

UserSchema.pre('save', async function () {
  if (this.$locals.password !== undefined) {
    this.passwordHash = await hashPassword(this.$locals.password as string);
    delete this.$locals.password;
  }
});

export default mongoose.model('UserModel', UserSchema);
