import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    
    profileImage: String,
    post: String,
    photo: String,
    audio: String,
    username: String,
    name: String,
    email: String,
    phoneNumber: String
});

export default mongoose.model("post", postSchema);