const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  gigID: {
    // ИСПРАВЛЕНО: Тип String заменен на ObjectId для исключения конфликтов NoSQL-агрегации и устранения вечной загрузки
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  star: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5]
  },
  description: {
    type: String,
    required: true,
  },
}, {
  versionKey: false,
  timestamps: true 
});

module.exports = mongoose.model('Review', reviewSchema);
