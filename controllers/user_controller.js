const user_model = require('../models/user_model');
const Message = require('../models/messager_model');
const moment = require('moment');
require('dotenv').config();
const AWS = require('aws-sdk');
const { v4: uuid} = require('uuid');
const conversation_model = require('../models/conversation_model');
AWS.config.update({
    accessKeyId:process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_KEY_ID,
    region:process.env.REGION
});

const CLOUD_FONT_URL = 'https://d3pgq3xdjygd77.cloudfront.net/';
const s3 = new AWS.S3({
    accessKeyId:process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_KEY_ID
});

module.exports.showProfile = async (req,res)=>{
    const userId = req.params.userId;
    const user = await user_model.findById(userId);
    res.render("profile",{
        user:user
    });
}



module.exports.create_group = (req,res)=>{

    const {name_group,list_user,userId} = req.body;
    let list_member = list_user;
    list_member.push(userId);
    if(req.file){
        const image = req.file.originalname.split('.');
        const fileType = image[image.length-1];
        const filePath = `${uuid() + Date.now().toString()}.${fileType}`; 

        const params = {
            Bucket: "uploads3-chat-app",
            Key: filePath,
            Body: req.file.buffer
        }
    
        s3.upload(params,(err,data)=>{
            if(err){
                console.log(err);
                res.render('login-pages',{bigFile:true});
            }
            else{
                const newConversation = new conversation_model({
                    nameConversation: name_group,
                    members: list_member,
                    creatorId: userId,
                    imgConversation: `${CLOUD_FONT_URL}${filePath}`
                });
            
                newConversation.save((err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(data + " true");
                        res.redirect("/user?userId="+userId);
                    }
                });
            }

        });

    }else{
        const newConversation = new conversation_model({
            nameConversation: name_group,
            members: list_member,
            creatorId: userId,
            imgConversation:'https://d3pgq3xdjygd77.cloudfront.net/user-avatar.png'
        });
    
        newConversation.save((err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data +" false");
                res.redirect("/user?userId="+userId);
            }
        });
    }

}



module.exports.deleteUser = async (req,res)=>{
    const userName = req.query.userName;
    const adminId = req.query.adId;
    const deletedUser =await user_model.findOneAndDelete({userName:userName});
    res.redirect('/users/admin?userId='+adminId);
}

module.exports.getListUser = async (req,res)=>{
    const userId = req.query.userId;
    if(userId){
        const users = await user_model.find({role:"User"});
        const admin = await user_model.findOne({_id:userId});
        if(users && admin.role === 'Admin'){
            res.render('admin-pages',{
                users:users,
                adId:userId
            });
        }
    }else{
        return res.status(403).json("Ban khong co quyen truy cap");
    }  
}

module.exports.editUser = async (req,res)=>{
    const userName = req.query.userName;
    const adminId = req.query.adId;
    const user = await user_model.findOne({userName:userName});
    if(user.isAuth){
        const userUpdated = await user_model.findOneAndUpdate({userName:userName},{isAuth:false});
        res.redirect('/users/admin?userId='+adminId);
    }else{
        const userUpdated = await user_model.findOneAndUpdate({userName:userName},{isAuth:true});
        res.redirect('/users/admin?userId='+adminId);
    }
    
}

module.exports.getUser = async (req,res)=>{
    const userId = req.query.userId;
    const user = await user_model.findOne({_id:userId});
    try {
        const friends = await conversation_model.find({$and:[{members:{$in:userId}},{$members: {$size:2}}]});
                const group = conversation_model.find({$and:[{members:{$in:userId}},{$members: {$size:{$gt:3}}}]});
                let arr1 = [];
                for(let i=0;i<friends.length;i++){
                    arr1.push(friends[i].members.find((item)=> item !== userId));
                }
                async function lookUser(users) {
                    let list_user = [];
                    for (let u of users) {
                        try {
                            let found = await user_model.findById(u).exec();
                            list_user.push(found);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    return list_user;
                }

                let listFriend = [];
                let list = user.listFriend;
                const listUserInListFriend = await lookUser(list);
                
                lookUser(arr1).then(found => {
                    for(let i=0;i<found.length;i++){
                        listFriend.push({
                            "conversationId":friends[i]._id,
                            "friendId":found[i]._id,
                            "friendName":found[i].userName,
                            "friendImg":found[i].image_url,
                            "senderId":userId
                        });
                    }
                    res.render("chat-pages",{
                        list_conversation:listFriend,
                        listGroup:group,
                        senderId:userId,
                        myProfile:user,
                        listUserInListFriend:listUserInListFriend
                    })
                    
                }).catch(err => {
                    console.log(err);
                });

    } catch (error) {
        console.log(error);
    }
}



module.exports.search = async (req, res) => {
    const fname = req.query.friendName;
    const senderId = req.query.senderId;
    const user = await user_model.findOne({_id:senderId});
    try {
        const friend = await user_model.findOne({$and:[{userName:fname},{role:"User"}]});
      
        if(!friend){
            const friends = await conversation_model.find({$and:[{members:{$in:senderId}},{$members: {$size:2}}]});
            const group = conversation_model.find({$and:[{members:{$in:senderId}},{$members: {$size:{$gt:3}}}]});
            let arr1 = [];
            for(let i=0;i<friends.length;i++){
                arr1.push(friends[i].members.find((item)=> item !== senderId));
            }
            async function lookUser(users) {
                let list_user = [];
                for (let u of users) {
                    try {
                        let found = await user_model.findById(u).exec();
                        list_user.push(found);
                    } catch (error) {
                        console.log(error);
                    }
                }
                return list_user;
            }

            let listFriend = [];
            let list = user.listFriend;
            const listUserInListFriend = await lookUser(list);
            lookUser(arr1).then(found => {
                for(let i=0;i<found.length;i++){
                    listFriend.push({
                        "conversationId":friends[i]._id,
                        "friendId":found[i]._id,
                        "friendName":found[i].userName,
                        "friendImg":found[i].image_url,
                        "senderId":senderId
                    });
                }

                res.render("chat-pages", {
                    list_conversation:listFriend,
                    listGroup:group,
                    senderId: senderId,
                    noti:"Không tìm thấy "+ fname,
                    myProfile:user,
                    listUserInListFriend:listUserInListFriend
                });
            }).catch(err => {
                console.log(err);
            });
        }else if(friend._id.toString() != user._id.toString()){
            const friends = await conversation_model.find({$and:[{members:{$all:[senderId,friend._id.toString()]}},{$members: {$size:2}}]});
            const sentRequest = user.sendRequest;
            const list_friend = user.listFriend;
            const list_request = user.request;

            //truong hop chua chat
            if(friends.length == 0){
                if(sentRequest.includes(friend._id.toString()) || list_friend.includes(friend._id.toString()) || list_request.includes(friend._id.toString())){
                    res.render("search", {
                        friend:friend,
                        senderId: senderId,
                        myProfile:user,
                        sentRequest:true
                    });
                }else{
                    res.render("search", {
                        friend:friend,
                        senderId: senderId,
                        myProfile:user,
                        sentRequest:false
                    });
                }
                
            }else{
                let arr1 = [];
                for(let i=0;i<friends.length;i++){
                    arr1.push(friends[i].members.find((item)=> item !== senderId));
                }
                async function lookUser(users) {
                    let list_user = [];
                    for (let u of users) {
                        try {
                            let found = await user_model.findById(u).exec();
                            list_user.push(found);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    return list_user;
                }
                let listFriend = [];
                let list = user.listFriend;
                const listUserInListFriend = await lookUser(list);
                lookUser(arr1).then(found => {
                    for(let i=0;i<found.length;i++){
                        listFriend.push({
                            "conversationId":friends[i]._id,
                            "friendId":found[i]._id,
                            "friendName":found[i].userName,
                            "friendImg":found[i].image_url,
                            "senderId":senderId
                        });
                    }
                    res.render("chat-pages",{
                        list_conversation:listFriend,
                        senderId:senderId,
                        myProfile:user,
                        listUserInListFriend:listUserInListFriend
                    })
                    
                }).catch(err => {
                    console.log(err);
                });
            }
        }
        else{
            res.render("search",{
                myProfile:user,
                me:user
            });
        }
    } catch (error) {
        console.log(error);
    }
}




module.exports.getListRequest = async (req,res)=>{
    const userId = req.query.userId;
    const user = await user_model.findById(userId);
    async function lookUser(users) {
        let list_user = [];
        for (let u of users) {
            try {
                let found = await user_model.findById(u).exec();
                list_user.push(found);
            } catch (error) {
                console.log(error);
            }
        }
        return list_user;
    }

    lookUser(user.request).then(s=>{        
        //console.log(list_user_send_request);
        res.render("friendlist",{
            myProfile:user,
            listSentRequest:s,
            senderId:userId
        });
    }).catch(err => {
        console.log(err);
    });


    
}
module.exports.addNewFriend = async (req,res)=>{
    const userId = req.body.userId;
    const receiverId = req.body.receiverId;
    const userSendRequest = await user_model.findOneAndUpdate({_id:userId},{$push:{sendRequest:receiverId}});
    const friendGetRequest = await user_model.findOneAndUpdate({_id:receiverId},{$push:{request:userId}});
    res.send({
        mess:"ok"
    });
}   

module.exports.processFriendRequest = async (req,res)=>{
    const userId = req.body.senderId;
    const sentRequestId = req.body.receiverId;
    const loai = req.body.loai;
    if(loai == "chapnhan"){
        try{
            const userSendRequest = await user_model.findByIdAndUpdate(sentRequestId,{$pull:{"sendRequest":userId}});
            const friendGetRequest = await user_model.findByIdAndUpdate(userId,{$pull:{"request":sentRequestId}});
            
            const newFriendUser =await user_model.findOneAndUpdate({_id:userId},{$push:{listFriend:sentRequestId}});
            const newFriendUser2 =await user_model.findOneAndUpdate({_id:sentRequestId},{$push:{listFriend:userId}});
            res.redirect("/users/listRequest?userId="+userId);
        }catch(err){
            console.log(err);
        }
    }else if(loai == "tuchoi"){
        try{
            const userSendRequest = await user_model.findByIdAndUpdate(sentRequestId,{$pull:{"sendRequest":userId}});
            const friendGetRequest = await user_model.findByIdAndUpdate(userId,{$pull:{"request":sentRequestId}});
            res.redirect("/users/listRequest?userId="+userId);
        }catch(err){
            console.log(err);
        }
    }
    
    
}