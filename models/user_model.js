const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    email: {type:String,unique:true},
    password: String,
    userName: {type:String,unique:true},
    role: {
        type: String,
        default: 'User'
    },
    isAuth: {
        type: Boolean,
        default: false
    },
    hashId: String,
    image_url:{
        type:String,
        default:'https://d3pgq3xdjygd77.cloudfront.net/user-avatar.png'
    },
    sendRequest:{
        type:Array
    },
    request:{
        type:Array
    },
    listFriend:{
        type:Array
    }
},{timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;