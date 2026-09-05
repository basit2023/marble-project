import "server-only";
import { Schema, model, models, type Model } from "mongoose";
// Operational TTL counter, not public content.
interface ISecurityLimit { _id: string; count: number; expiresAt: Date }
const schema = new Schema<ISecurityLimit>({
  _id: String, count: { type: Number, required: true }, expiresAt: { type: Date, required: true },
}, { versionKey: false });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const SecurityLimit = (models.SecurityLimit as Model<ISecurityLimit> | undefined) ?? model<ISecurityLimit>("SecurityLimit", schema);

