import mongoose, {Schema} from 'mongoose'


const amenitiesSchema = new Schema({
    gym:{
        type: String,
        enum:["Available","Unavailable"]
    },
    visitorParking:{
        type: String,
        enum:["Availablem", "Unavailable"]
    },
    garden:{
        type: String,
        enum:["Availablem", "Unavailable"]
    },
    swimmingPool:{
        type: String,
        enum:["Availablem", "Unavailable"]
    },
    clubHouse:{
        type: String,
        enum:["Availablem", "Unavailable"]
    },
    nearbySchool:{
        type: String,
        required: true
    },
    nearbyHospital:{
        type: String,
        required: true
    },
    nearbyBusStation:{
        type: String,
        required: true
    },
    nearbyRailwayStation:{
        type: String,
        required: true
    },

})


export const Amenities = mongoose.model('Amenities', amenitiesSchema)