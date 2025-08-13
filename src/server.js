dotenv.config();
import app from "./app.js";
import dotenv from "dotenv";
import {createServer} from "http";
import databaseConnection from "./config/db.js";



const PORT = process.env.PORT || 3000;

await databaseConnection();

const server = createServer(app);

server.listen(PORT,()=>{
    console.log(`Sever is running on port ${process.env.PORT}`)
})