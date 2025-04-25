const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: { type: String },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phone: { 
        type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);
