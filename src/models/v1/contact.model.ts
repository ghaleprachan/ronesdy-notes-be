import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    title: String,
    body: String,
  });
  
  export const Contact = mongoose.model('Contact', contactSchema);