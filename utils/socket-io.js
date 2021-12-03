let io;
const user_controller = require('../controllers/user_controller');
const message_controller = require('../controllers/message_controller');
const user_model = require('../models/user_model');
const message_model = require('../models/messager_model');
const conversation_model = require('../models/conversation_model');
const fs = require('fs');
require('dotenv').config();
const AWS = require('aws-sdk');
const { v4: uuid} = require('uuid');
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


exports.socketConnection = (server) => {
    const {
        Server
    } = require("socket.io");
    const io = new Server(server);

    let users = [];
    
    const adduser = (userId,socketId)=>{
        !users.some(user=>user.userId === userId) && users.push({userId,socketId});
    }

    const removeuser = (socketId)=>{
        users = users.filter(user=>user.socketId !== socketId);

    }

    const getUser = (userId)=>{
        return users.find(user=>user.userId === userId);
    }
    io.on('connection', (socket) => {
        console.log(`${socket.id} has connected`);
        
        // get userid va socketid
        socket.on('addUser',(data)=>{
            adduser(data.userId,socket.id);
        });
        
        socket.on("sendImage",async (data)=>{
            const user = getUser(data.receiverId);
            const user2 = getUser(data.senderId);
            const conversationId = data.conversationId;
            const conversation = await conversation_model.findById(conversationId);
            const userSender = await user_model.findById(data.senderId);
            const img = data.img;
            let newMessage = null;
            const buf = Buffer.from(img.replace(/^data:image\/\w+;base64,/, ""),'base64');
            const type = img.split(';')[0].split('/')[1];
            const filePath = `${uuid() + Date.now().toString()}.${type}`;
            const params = {
                Bucket: "uploads3-chat-app",
                Key: filePath,
                Body: buf,
                ContentEncoding: 'base64',
                ContentType: `image/${type}`
            }
            s3.upload(params, async (err,data1)=>{
                if(err){
                    console.log(err);
                }else{
                    if(conversation){
                        newMessage = new message_model({senderId:data.senderId,content:`${CLOUD_FONT_URL}${filePath}`,type:"image",conversationId:conversationId});
                    }else{
                        const newConversation = new conversation_model({
                            members:[data.senderId,data.receiverId],
                        
                        });
                        console.log(newConversation._id.toString());
                        newMessage = new message_model({senderId:data.senderId,content:`${CLOUD_FONT_URL}${filePath}`,type:"image",conversationId:newConversation._id.toString()});
                    }
                    const savedmess = await newMessage.save();
                    

                    if(!user){
                        io.to(user2.socketId).emit("getImage",{
                            nameSender:userSender.userName,
                            senderId:data.senderId,
                            content:savedmess.content,
                            time:savedmess.createdAt,
                            urlImg:userSender.image_url
                        });
                    }else{
                        io.to(user.socketId).emit("getImage",{
                            nameSender:userSender.userName,
                            senderId:data.senderId,
                            content:savedmess.content,
                            time:savedmess.createdAt,
                            urlImg:userSender.image_url
                        })
                        io.to(user2.socketId).emit("getImage",{
                            nameSender:userSender.userName,
                            senderId:data.senderId,
                            content:savedmess.content,
                            time:savedmess.createdAt,
                            urlImg:userSender.image_url
                        })
                    }  
                }
            })  


        })
    
        //send message
        socket.on("sendMessage",async (data)=>{
            try {
                const user = getUser(data.receiverId);
                const user2 = getUser(data.senderId);
                console.log(users);
                const conversationId = data.conversationId;
                const conversation = await conversation_model.findById(conversationId);
                let newMessage = null;
                if(conversation){
                    newMessage = new message_model({senderId:data.senderId,content:data.text,type:"text",conversationId:conversationId});
                }else{
                    const newConversation = new conversation_model({
                        members:[data.senderId,data.receiverId],
                    
                    });
                    const savedConversation = await newConversation.save();
                    newMessage = new message_model({senderId:data.senderId,content:data.text,type:"text",conversationId:savedConversation._id.toString()}); 
                }
            
                const savedmess = await newMessage.save();
                const userSender = await user_model.findById(data.senderId);
                if(!user){
                    io.to(user2.socketId).emit("getMessage",{
                        nameSender:userSender.userName,
                        senderId:data.senderId,
                        content:data.text,
                        time:savedmess.createdAt,
                        urlImg:userSender.image_url
                    });
                }else{
                    io.to(user.socketId).emit("getMessage",{
                        nameSender:userSender.userName,
                        senderId:data.senderId,
                        content:data.text,
                        time:savedmess.createdAt,
                        urlImg:userSender.image_url
                    })
                    io.to(user2.socketId).emit("getMessage",{
                        nameSender:userSender.userName,
                        senderId:data.senderId,
                        content:data.text,
                        time:savedmess.createdAt,
                        urlImg:userSender.image_url
                    })
                } 
            } catch (error) {
                console.log("Error");
            }
                  
        });

        // co the la ko remove khoi mang
        socket.on('disconnect',()=>{
            console.log("a user disconnect");
            removeuser(socket.id);
            io.emit("getUser",users);
        })

    });
}