import dotenv from 'dotenv'
import connecToDb from './db/index.db.js'
import {app} from './app.js'

dotenv.config({
    path:'./.env'
})

connecToDb()
.then(()=>{
    app.listen(process.env.port || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Mongo DB Connection Failed!!", error)
})