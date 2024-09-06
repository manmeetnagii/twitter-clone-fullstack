import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    
username: String,
phoneNumber:String,
name: String,
email: String,
bio: String,
dob: String,
location: String,
website: String,
profileImage: String,
coverImage: String,
});

export default mongoose.model("user", userSchema);