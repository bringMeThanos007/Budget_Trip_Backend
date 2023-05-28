const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require('cors');
const app = express();
const { ObjectId } = require("mongodb");

const errorMiddleware = require("./middleware/error");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
// const { store } = require("../frontend/src/Backstore");
const path = require("path");
// const dotenv = require("dotenv");
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "Backend/config/config.env" });
}
// dotenv.config({ path: "Backend/config/config.env" });
// const mongoUrl = "mongodb://localhost:27017/";
const mongoUrl = process.env.DB_URI;
const corsOptions = {
  origin: "http://192.168.56.1:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // allowedHeaders: "Content-Type,Authorization",
};


app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use((req, res, next) => {
    // req.store = store;
    res.setHeader("Access-Control-Allow-Origin", "http://192.168.56.1:3000");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


const product = require("./routes/productRoutes");
const product1 = require("./routes/product1Routes");
const user = require("./routes/userRoutes");
const vendor = require("./routes/vendorRoutes");
const guide = require("./routes/guideRoutes");
const order = require("./routes/orderRoutes");
const payment = require("./routes/paymentRoutes")
const requestsRoute = require("./routes/requests");
app.use("/api/v1", requestsRoute);

//have to create new vendor route order1 in future
app.use("/api/v1",product);
app.use("/api/v1",product1);
app.use("/api/v1",user);
app.use("/api/v1",vendor);
app.use("/api/v1",guide);
app.use("/api/v1",order);
app.use("/api/v1",payment);
app.get("/collections", async (req, res) => {
  try {
    const client = await MongoClient.connect(mongoUrl);
    const collections = await client
      .db("Budgetrip")
      .listCollections()
      .toArray();
    const collectionNames = collections.map((col) => col.name);
    client.close();

    res.json(collectionNames);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/collections/:collection", async (req, res) => {
  const collectionName = req.params.collection;

  try {
    const client = await MongoClient.connect(mongoUrl);
    const collection = client.db("Budgetrip").collection(collectionName);

    const data = await collection.find().toArray();
    client.close();

    res.json(data);
  } catch (error) {
    console.error(
      `Error fetching data from collection ${collectionName}:`,
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.delete("/deleteRecord/:collection/:id", async (req, res) => {
  const collectionName = req.params.collection;
  const dataId = req.params.id;

  try {
    const client = await MongoClient.connect(mongoUrl);
    const collection = client.db("Budgetrip").collection(collectionName);

    // Perform the necessary operations to delete the record from the collection based on the dataId
    await collection.deleteOne({ _id: ObjectId(dataId) });

    client.close();

    res.sendStatus(204); // Send a successful response with status code 204 (No Content)
  } catch (error) {
    console.error(
      `Error deleting record with ID ${dataId} from collection ${collectionName}:`,
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// app.use(express.static(path.join(__dirname, "../frontend/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
// });


//middleware for errors

app.use(errorMiddleware);
module.exports=app