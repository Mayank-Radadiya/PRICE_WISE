// import mongoose from "mongoose";

// // Track DbConnection
// let isConnected = false;

// export const dbConnection = async () => {
//   //The mongoose.set("strictQuery", true); line is used to enable strict mode for queries in Mongoose. It ensures that only explicitly defined fields in the schema can be queried, which can help prevent mistakes and improve security.
//   mongoose.set("strictQuery", true);

//   if (!process.env.MONGODB_URI)
//     return console.log("MongoDbURI => DB URI is required");

//   try {
//     const DB = await mongoose.connect(process.env.MONGODB_URI);
//     isConnected = true;
//     console.log("Connected to MongoDB ");
//   } catch (error: any) {
//     throw new Error(`Error connecting to MongoDB => ${error.message}`);
//   }
// };
