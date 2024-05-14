const { Server } = require("socket.io");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors"); 
const bcrypt = require('bcrypt');
const jwt= require('jsonwebtoken')
const bodyParser = require('body-parser');
app.use(express.json());

app.use(bodyParser.json());
const JWT_SECRET ='fdjksljdfklfdldfkldlmlk'
const io = new Server(8000, {
  cors: true,
});
app.listen(5000, () => {
  console.log("Server Started");
});

app.use(cors());
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
app.use(express.json());
app.use(cors()); 

const mongoUrl = "mongodb+srv://arsath:000@cluster0.ya4ajv9.mongodb.net/VitualEvent";
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("database connected");
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });

  require("./userdetail");

const Employee = mongoose.model("Employee");

//user register
app.post("/register", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  try {
    const oldUser = await Employee.findOne({ email });
    const hashedPas=await bcrypt.hash(password,10)
    if (oldUser) {
      res.send({ error: "User already exists" });

    } else {
      await Employee.create({
        fname,
        lname,
        email,
        password:hashedPas,
      });
      res.send({ status: "ok" });
    }
  } catch (error) {
    res.send({ status: "error" });
  }
});


//login User with jwt token

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await Employee.findOne({ email });
      if (!user) {
          return res.json({ error: "User not found" });
      }

    const passwordMatch=await bcrypt.compare(password,user.password)
      if (!passwordMatch) {
          return res.json({ error: "Invalid password" });
      }
      const token = jwt.sign({ id: user._id }, 'your_secret_key');
      res.json({ status: "ok", data: token });
  } catch (error) {
      console.error("Error during login:", error);
      res.json({ error: "Internal server error" });
  }
});


// get single user data
app.post('/userData', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    const userId = decoded.id;

    const user = await Employee.findById(userId);
    if (!user) {
      return res.json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'ok', data: user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.json({ status: 'error', message: 'Internal server error' });
  }
});

//create name 


const UserCreateSchema = new mongoose.Schema({
  name: { type: Date, required: true },
 
}, {
  collection: "Name",
});

const NameModel = mongoose.model("Name", UserCreateSchema);

app.post('/userCreateName', async (req, res) => {
  try {
    const { name } = req.body;
    const newDateTime = new NameModel({ name });
    await newDateTime.save();
    res.status(200).send('Date-time added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding date-time');
  }
});

//date and time create

const dateSchema = new mongoose.Schema({
  id:{type:String},
  title:{type:String},
  password:{type:String},
    date: { type: Date, required: true },
    time: { type: String, required: true } 
});

const DateModel = mongoose.model('Date', dateSchema);


app.post('/api/dates', async (req, res) => {
  try {
    
      const {id,title,password, date, time } = req.body;
      const newDate = await DateModel.create({title,id,password, date, time });
      res.status(201).json(newDate);
  } catch (err) {
      console.error('Error creating date:', err);
      res.status(500).json({ error: 'Server error' }); // Sending error response
  }
});

//get Date And time
app.get('/api/dates', async (req, res) => {
  try {
    // Fetch all dates from the database
    const dates = await DateModel.find();
    const datesLenght=dates.length;
    res.status(200).json(dates);
  } catch (err) {
    console.error('Error fetching dates:', err);
    res.status(500).json({ error: 'Server error' }); // Sending error response
  }
});

//register
app.post("/register", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  try {
    const oldUser = await Employee.findOne({ email });
    const hashedPas=await bcrypt.hash(password,10)
    if (oldUser) {
      res.send({ error: "User already exists" });

    } else {
      await Employee.create({
        fname,
        lname,
        email,
        password:hashedPas,
      });
      res.send({ status: "ok" });
    }
  } catch (error) {
    res.send({ status: "error" });
  }
});


//get userAll user
app.get('/getAlluser', async (req, res) => {
  try {
    const allUser = await Employee.find({});
    const usersCount = allUser.length; 
    res.send({ status: "ok", data: allUser});
  
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).send({ error: "Error fetching all users" }); // Sending error response
  }
});

//delete user

app.delete('/deleteUser/:userId', async (req, res) => {
  try {
    const deletedUser = await Employee.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send({ status: "ok", data: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ error: "Error deleting user" });
  }
});

//admin Register
require("./admindetail");
const Admin = mongoose.model("Admin");

app.post("/adminRegister", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  try {
    const oldUser = await Admin.findOne({ email });
    const hashedPas=await bcrypt.hash(password,10)
    if (oldUser) {
      res.send({ error: "User already exists" });

    } else {
      await Admin.create({
        fname,
        lname,
        email,
        password:hashedPas,
      });
      res.send({ status: "ok" });
    }
  } catch (error) {
    res.send({ status: "error" });
  }
});
//delete admin
app.delete('/deleteAdmin/:adminId', async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.adminId);
    if (!deletedAdmin) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send({ status: "ok", data: deletedAdmin });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ error: "Error deleting user" });
  }
});

//admin login 
app.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await Admin.findOne({ email });
      if (!user) {
          return res.json({ error: "User not found" });
      }

    const passwordMatch=await bcrypt.compare(password,user.password)
      if (!passwordMatch) {
          return res.json({ error: "Invalid password" });
      }
      const token = jwt.sign({ id: user._id }, 'your_secret_key');
      res.json({ status: "ok", data: token });
  } catch (error) {
      console.error("Error during login:", error);
      res.json({ error: "Internal server error" });
  }
});

//get data from admin

app.get('/getAdmin',async(req,res)=>{
  try{
    const allAdmin=await Admin.find({});
    const allAdminLenght=allAdmin.length;

    res.send({status:"ok",data:allAdmin});
    
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).send({ error: "Error fetching all users" }); // Sending error response
  }
})





//socket.io

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});


