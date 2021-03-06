const user_model = require('../models/user_model');
const Conversation = require('../models/conversation_model');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = Buffer.from('FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=','base64'); 
const IV_LENGTH = 16;
const nodemailer = require('nodemailer');
require('dotenv').config();
const AWS = require('aws-sdk');
const { v4: uuid} = require('uuid');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const OAuth2_client = new OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET);
OAuth2_client.setCredentials({refresh_token:process.env.REFRESH_TOKEN});
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
function makeRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function sendEmailAuth(customer_email,rd) {
    const accessToken = OAuth2_client.getAccessToken();
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type:'OAuth2',
            user: process.env.USER_EMAIL,
            clientId:process.env.CLIENT_ID,
            clientSecret:process.env.CLIENT_SECRET,
            refreshToken:process.env.REFRESH_TOKEN,
            accessToken:accessToken
        },
    });
    
        var mailOption = {
            from: process.env.USER_EMAIL,
            to: customer_email,
            subject: 'Xác minh email',
            text: 'Xác minh email',
            html: '<a style="font-family:'+"Ubuntu Mono"+', monospace; display:inline-block; color:#ffffff; background-color:forestgreen; font-size:14px; font-weight:bold; text-decoration:none; padding-left:20px; padding-right:20px; padding-top:20px; padding-bottom:20px;" href="https://cnm-chat-app.herokuapp.com/auth/complete-register/' + rd + '">Verify E-mail Address</a>'
            
        }
    
        transporter.sendMail(mailOption, (err, info) => {
            if (err) console.log(err);
            else {
                console.log('Email sent ' + info.response);
            }
        });
    
}
function encrypt(text) {
	let iv = crypto.randomBytes(IV_LENGTH);
	let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
	let textParts = text.split(':');
	let iv = Buffer.from(textParts.shift(), 'hex');
	let encryptedText = Buffer.from(textParts.join(':'), 'hex');
	let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}




module.exports.change_password = async (req,res)=>{
    const userId = req.body.userId;
    const old_pass = req.body.old_pass;
    const new_pass = req.body.new_pass;
    const user = await user_model.findById(userId);
    const pass_in_db = decrypt(user.password);
    const new_pass_en = encrypt(new_pass);
    if(pass_in_db != old_pass){
        res.send({mess:"saimk"});
    }else{
        const newUser = await user_model.findOneAndUpdate({_id:userId},{password:new_pass_en});
        res.send({mess:"ok"});
    }
}
module.exports.change_avata = async (req,res)=>{
    const {userId} = req.body;
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
                res.send({tbfile:"Đổi ảnh đại diện không thành công"});
            }
            else{
                user_model.findOneAndUpdate({_id:userId},{$set:{image_url:`${CLOUD_FONT_URL}${filePath}`}},(err,data1)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.send({tbfile:"Đổi ảnh đại diện thành công"});
                    }
                });
                
            }
    
        });

    }else{
        res.send({tbfile:"Phải chọn ảnh để đổi ảnh đại diện"});
    }
    
}
module.exports.dangki = async (req, res) => {
    const {email,user_name,password} = req.body;
    let rd = makeRandomString(16);
    let newPass = encrypt(password);
    const numC = await user_model.countDocuments();
    const userInDb = await user_model.findOne({$or:[{email:email},{userName:user_name}]});
    if(userInDb){
        res.render('login-pages',{tontai:true});
    }else{
        if(numC == 0){
            const user = new user_model({
                email: email,
                password: newPass,
                userName: user_name,
                hashId: rd,
                role:"Admin",
                isAuth:true
            });
            user.save((err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/");
                }
            });
        }else{
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
                        const user = new user_model({
                            email: email,
                            password: newPass,
                            userName: user_name,
                            hashId: rd,
                            image_url: `${CLOUD_FONT_URL}${filePath}`
                        });
                    
                        user.save((err, data) => {
                            if (err) {
                                console.log(err);
                            } else {
                                sendEmailAuth(data.email,rd);
                                res.redirect("/");
                            }
                        });
                    }
            
                });
        
            }else{
                const user = new user_model({
                    email: email,
                    password: newPass,
                    userName: user_name,
                    hashId: rd,
                });
            
                user.save((err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        sendEmailAuth(data.email,rd);
                        res.redirect("/");
                    }
                });
            }
        }  
    }
    
}
module.exports.dangnhap = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const user = await user_model.findOne({email:email});
    
    if(user){
        const userId = user._id.toString();
        const depass = decrypt(user.password); 
        if(password == depass){
            if(user.role === 'Admin'){
                res.redirect('/users/admin?userId='+userId);
            }else{
                if(user.isAuth === true){
                    try {
                        res.redirect('/users?userId='+userId);
                    } catch (error) {
                        console.log(error);
                    }
                }else{
                    res.render('login-pages',{chuakichhoat:true});
                }    
            } 
        }else{
            res.render('login-pages',{saimk:true});
        }

           
    }else{
        res.render('login-pages',{saiemail:true});
    }
}
module.exports.dangki_thanhcong = (req, res) => {
    const hashId = req.params.hashId;
    user_model.findOneAndUpdate({hashId: hashId},{$set:{isAuth: true}},(err,data)=>{
        if(err){
            console.log(err);
        }else{
            res.render('register_finish');
        }
    })
    
}