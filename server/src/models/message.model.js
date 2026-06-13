const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationID: {
    type: String,
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: ""
  },
  files: {
    type: [String], // Массив строк для поддержки множественных файлов за один раз
    default: []
  },
  isRead: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true // Автоматически добавляет и обновляет createdAt (дата и время отправки)
});

module.exports = mongoose.model('Message', messageSchema);
