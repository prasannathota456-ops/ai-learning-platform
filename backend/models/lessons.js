const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);