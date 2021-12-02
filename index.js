const express = require('express');
const mongoose = require('mongoose');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const http = require('http');
const server = http.createServer(app);
const user_router = require('./routes/user_route');
const auth_router = require('./routes/auth_route');
const message_router = require('./routes/message_route');
const {socketConnection} =require('./utils/socket-io');
socketConnection(server);
mongoose.connect(process.env.MONGO_URL);


require('dotenv').config({
    path: __dirname + "/.env"
})
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static('./views'));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use('/users', user_router);
app.use('/auth',auth_router);
app.use('/messages',message_router);


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/assets/images'));


app.get('/', (req, res) => {
    res.render('login-pages');
});






server.listen(3000, () => {
    console.log('Server is running 3000...');
});

