const mongoose=require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserDetailsSchema=new mongoose.Schema({
    fname:{type:String,required:true},
    lname:{type:String,required:true},
  email:{type:String,unique:true,required:true},
    password:{
    type:String,required:true}
  

},{
    collection:"Employee",
});


mongoose.model("Employee",UserDetailsSchema)