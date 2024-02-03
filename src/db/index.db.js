import mongoose from 'mongoose'
import { DB_NAME } from '../constant.js'

const connecToDb = async()=>{
    try {
        
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)

        console.log("\n Mongoose connected !! DB host: ", connectionInstance.connection.host)

    } catch (error) {
        console.log("Connection Error", error)
        process.exit(1)
        
    }

    
}

export default connecToDb;