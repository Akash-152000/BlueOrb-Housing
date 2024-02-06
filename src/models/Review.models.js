import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const reviewSchema = new Schema({
    content:{
        type:String,
        required: true
    },
    property:{
        type: Schema.Types.ObjectId,
        ref:'Property'
    },
    reviewBy:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true})

reviewSchema.plugin(mongooseAggregatePaginate)

export const Review = mongoose.model('Review', reviewSchema)