import mongoose from 'mongoose';

const systemInfoSchema = new mongoose.Schema({
email: String,
phoneNumber: String,
browser: String,
os: String,
ip: String,
device: String,
country: String,
state: String,
city: String,
},
{
    timestamps: true
});
export default mongoose.model("systemInfo", systemInfoSchema);