const mongoose = require('mongoose');

const connectDB = (url) => {
  // Thiết lập strictQuery để loại bỏ cảnh báo
  mongoose.set('strictQuery', false); // Hoặc false tùy vào yêu cầu của bạn

  return mongoose.connect(url).then(() => {
    console.log('MongoDB connection successful');
  }).catch((err) => {
    console.error('MongoDB connection error:', err);
  });;
};

module.exports = connectDB;
