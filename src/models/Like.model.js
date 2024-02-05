import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({

    property:{
        type: Schema.Types.ObjectId,
        ref: 'Property'
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

},{timestamps:true})

export const Like = mongoose.model('Like',likeSchema)
