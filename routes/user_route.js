const express = require('express');
const user_router = express.Router();
const user_controller = require('../controllers/user_controller');
const multer = require('multer');
const converFormToJson = multer();
const path = require('path');
const storage = multer.memoryStorage({
    destination(req,file,callback){
        callback(null,'');
    }
});
function checkFileType(file,cb){
    const fileType = /jpeg|jpg|png|gif/;
    
    const extname = fileType.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileType.test(file.mimetype);
    
    if(extname && mimetype){
        return cb(null,true);
    }
    return cb("Error: imageOnly");
}
const upload = multer({
    storage,
    limits:{
        fileSize:2000000
    },
    fileFilter(req,file,cb){
        checkFileType(file,cb);
    }
});

//user_router.post('/register',upload.single('image'),user_controller.dangki);
user_router.post('/createGroup',upload.single('image'),user_controller.create_group);

//user_router.post('/',user_controller.dangnhap);
user_router.get('/',user_controller.getUser);
//user_router.get('/complete-register/:hashId',user_controller.dangki_thanhcong);
user_router.get('/search',user_controller.search);
//user_router.get('/getMessage',user_controller.getMessage);
user_router.get('/admin',user_controller.getListUser);
user_router.get('/admin/edit',user_controller.editUser);
user_router.get('/admin/delete',user_controller.deleteUser);
user_router.get('/listRequest',user_controller.getListRequest);
user_router.post('/addFriend',user_controller.addNewFriend);
user_router.post('/processFriendRequest',user_controller.processFriendRequest);
user_router.get('/user-info/:userId',user_controller.showProfile);
//user_router.post('/change-password',user_controller.change_password);

module.exports = user_router;