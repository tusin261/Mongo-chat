const mongoose = require("mongoose");
const ConversationSchema = new mongoose.Schema(
    {
      members:{
          type: Array
      },
      creatorId:{
          type:String
      },
      nameConversation:{
          type:String
      },
      imgConversation:{
          type:String
      }
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Conversation", ConversationSchema);