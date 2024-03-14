const { Server } = require("socket.io");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors"); 
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

const mongoUrl = "mongodb+srv://arsath:000@cluster0.ya4ajv9.mongodb.net/";
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
    if (oldUser) {
      res.send({ error: "User already exists" });
    } else {
      await Employee.create({
        fname,
        lname,
        email,
        password,
      });
      res.send({ status: "ok" });
    }
  } catch (error) {
    res.send({ status: "error" });
  }
});

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


//login 
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Employee.findOne({ email });

    if (!user) {
      // User not found
      res.status(401).send({ error: "Invalid email or password" });
      return;
    }

    // Check if the password is correct
    if (user.password !== password) {
      // Incorrect password
      res.status(401).send({ error: "Invalid email or password" });
      return;
    }

    // If email and password are correct, send a success response
    res.send({ status: "ok", user: { fname: user.fname, lname: user.lname, email: user.email } });
  } catch (error) {
    // Error while processing the request
    res.status(500).send({ error: "Internal server error" });
  }
});