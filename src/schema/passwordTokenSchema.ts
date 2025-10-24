import mongoose from "mongoose";

const passwordTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  selector: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

passwordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordToken = mongoose.model(
  "PasswordToken",
  passwordTokenSchema
);
