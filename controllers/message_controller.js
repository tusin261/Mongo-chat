const Message = require('../models/messager_model');
const conversation_model = require('../models/conversation_model');
const user_model = require('../models/user_model');
const moment = require('moment');
module.exports.getMessage = async (req, res) => {
    
    const senderId = req.query.senderId;
    const conversationId = req.query.conversationId;
    const receiverId = req.query.receiverId;
    const profileSender = await user_model.findOne({_id:senderId}); 
    const profileReceiver = await user_model.findOne({_id:receiverId});
    const in4Group = await conversation_model.findById(conversationId);
    const sentRequest = profileSender.sendRequest;
    const list_friend = profileSender.listFriend;
    const list_request = profileSender.request;
    try {
        const list_mess = await Message.find({conversationId:conversationId});
        const myUser = await user_model.findOne({_id:senderId});
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
        let list = profileSender.listFriend;
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
                if(!in4Group.nameConversation){
                    if(sentRequest.includes(receiverId) || list_friend.includes(receiverId) || list_request.includes(receiverId)){
                        res.render("chat-pages", {
                            list_conversation:listFriend,
                            listGroup:group,
                            senderId:senderId,
                            list_message:list_mess,
                            senderName:myUser.userName,
                            receiverId:receiverId,
                            myProfile:profileSender,
                            friendProfile:profileReceiver,
                            conversationId:conversationId,
                            moment:moment,
                            sentRequest:true,
                            listUserInListFriend:listUserInListFriend
                        });
                    }else{
                        res.render("chat-pages", {
                            list_conversation:listFriend,
                            listGroup:group,
                            senderId:senderId,
                            list_message:list_mess,
                            senderName:myUser.userName,
                            receiverId:receiverId,
                            myProfile:profileSender,
                            friendProfile:profileReceiver,
                            conversationId:conversationId,
                            moment:moment,
                            sentRequest:false,
                            listUserInListFriend:listUserInListFriend
                        });
                    }
                }else{
                    res.render("chat-pages", {
                        list_conversation:listFriend,
                        listGroup:group,
                        senderId:senderId,
                        list_message:list_mess,
                        senderName:myUser.userName,
                        receiverId:receiverId,
                        myProfile:profileSender,
                        conversationId:conversationId,
                        moment:moment,
                        in4Group:in4Group,
                        listUserInListFriend:listUserInListFriend
                    });
                }
                
            }).catch(err => {
                console.log(err);
            });
    } catch (error) {
        console.log(error);
    }
}

