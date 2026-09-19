import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, verifyPassword } from '#src/utils/auth.js';

export interface UserData {
  _id: string;
  name?: string | null;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
  password?: string;
}

export interface UserDocumentMethods {
  checkPassword(plainText: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<UserData, UserDocumentMethods>;
type UserModelType = Model<UserData, {}, UserDocumentMethods>;

const UserSchema = new Schema<UserData, UserModelType, UserDocumentMethods>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
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

UserSchema.virtual('password').set<UserDocument>(function setHash(password: string) {
  this.$locals.password = password;
});

UserSchema.method<UserDocument>(
  'checkPassword',
  async function checkPassword(plainText: string): Promise<boolean> {
    return verifyPassword(plainText, this.passwordHash);
  }
);

UserSchema.pre<UserDocument>('save', async function () {
  const password: unknown = this.$locals.password;
  if (password !== undefined) {
    if (typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    this.passwordHash = await hashPassword(password);
    delete this.$locals.password;
  }
});

const UserModel = model<UserData, UserModelType>('UserModel', UserSchema);

export default UserModel;
export { UserModel as User };
