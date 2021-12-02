const express = require('express');
const auth_router = express.Router();
const auth_controller = require('../controllers/auth_controller');
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

auth_router.post('/register',upload.single('image'),auth_controller.dangki);
auth_router.post('/',auth_controller.dangnhap);
auth_router.get('/complete-register/:hashId',auth_controller.dangki_thanhcong);
auth_router.post('/change-password',auth_controller.change_password);

module.exports = auth_router;