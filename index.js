import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";

import ImageKit from "imagekit";
import { findUsers } from "./controllers/users.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

//Initalizing imageKit:
  const imagekit = new ImageKit(
  {
    publicKey:"public_IIvGTPn+8v1DnRbgnZKW3iPXKnQ=",
    privateKey:"private_V3sd5RKcpc/uXKjnTnQoPBDse9g=",    
    urlEndpoint:"https://ik.imagekit.io/zzkbvyzbb"
  }
 )

export const uploadImage = async(req,folderLocation)=>{
  try{
    const dateTime = giveCurrentDateTime();
    const  file = req.file;
    
    //uploading image to imageKit to get the url
    const {url:imageURL} = await imagekit.upload({
      file:file.buffer,
      fileName:file.originalname+" "+dateTime
      ,folder: folderLocation,}
      );

    return imageURL;  
  }
  catch(err){
    throw err;
  }
 }
//Multer
const multerStorage = multer.memoryStorage();
const upload = multer({ multerStorage });



/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);

app.post("/posts", verifyToken, upload.single("picture"), createPost);
// app.post("/posts", verifyToken, createPost);



/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.get('/search/:searchTerm',findUsers);
app.get('/',(req,res)=>{
  res.send("Welcome to be backEnd Server");
})

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));


  function giveCurrentDateTime () {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
  }