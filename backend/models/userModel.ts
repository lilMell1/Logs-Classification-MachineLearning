import mongoose, { Schema, Document } from 'mongoose';

// defines types for typeScript
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

// defines the schema for the database
const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
},
{ collection: 'users' } 
);

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
