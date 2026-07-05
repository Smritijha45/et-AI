import mongoose, { Schema, Document } from 'mongoose';

export interface IFraudReport extends Document {
  victimId: string;
  victimName: string;
  phoneNumber?: string;
  upiId?: string;
  bankAccount?: string;
  deviceFingerprint?: string;
  reportTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FraudReportSchema: Schema = new Schema(
  {
    victimId: {
      type: String,
      required: [true, 'victimId is required'],
      trim: true,
      index: true
    },
    victimName: {
      type: String,
      required: [true, 'victimName is required'],
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    upiId: {
      type: String,
      trim: true,
      default: ''
    },
    bankAccount: {
      type: String,
      trim: true,
      default: ''
    },
    deviceFingerprint: {
      type: String,
      trim: true,
      default: ''
    },
    reportTimestamp: {
      type: Date,
      default: Date.now,
      required: [true, 'reportTimestamp is required']
    }
  },
  {
    timestamps: true
  }
);

// Add compound or individual indexes for search optimization if required
FraudReportSchema.index({ phoneNumber: 1 });
FraudReportSchema.index({ upiId: 1 });

export const Report = mongoose.model<IFraudReport>('Report', FraudReportSchema);
