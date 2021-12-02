const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema(
    {
      senderId: {
        type: String,
      },
      content: {
        type: String,
      },
      type:{
        type:String
      },
      conversationId:{
        type:String
      }
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Message", MessageSchema);