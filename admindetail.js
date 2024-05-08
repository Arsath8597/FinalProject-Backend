const mongoose=require('mongoose');
const AdminSchema=new mongoose.Schema({
    fname:String,
    lname:String,
  email:{type:String,unique:true},
    password:String,
  

},{
    collection:"Admin",
});

mongoose.model("Admin",AdminSchema)