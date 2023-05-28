const app = require('./app');
const cloudinary = require("cloudinary");
// const dotenv = require("dotenv");
const mongoose = require("mongoose");
const  connectDatabase = require("./config/database");
const cors = require("cors");
// Handling Uncaught Exception
process.on("uncaught Exception", (err) => {
    console.log(`Error: ${err.message}`);
console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});
//config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "Backend/config/config.env" });
}
// dotenv.config({ path: "Backend/config/config.env" });
//connecting to database
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://192.168.56.1:${process.env.PORT}`);
});
// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${ err.message }`);
console.log(`shutting down the server due to Unhandled Promise Rejection`);
server.close(() => {
process.exit(1);
});
});