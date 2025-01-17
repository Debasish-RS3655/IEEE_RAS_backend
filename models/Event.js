const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true
    },
    title: {
      type: String,
      max: 100
    },
    desc: {
      type: String,
      max: 1000,
    },
    img: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);