import mongoose, {Schema} from 'mongoose'

const notificationSchema = new Schema({
    sender:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    receiver:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    type:{
        type: String,
        enum: ['Like', 'Review']
    },
    read:{
        type: Boolean,
        default: false
    }
},{timestamps:true})

export const Notification = mongoose.model('Notification', notificationSchema)