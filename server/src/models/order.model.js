const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  weight: { type: Number, required: true }, // Процент от стоимости (40 или 60)
  sum: { type: Number, required: true },    // Сумма в рублях
  status: { 
    type: String, 
    // ИСПРАВЛЕНО ДЛЯ ВКР: Добавлен новый статус возврата на доработку
    enum: ['In_Progress', 'Under_Review', 'Completed', 'Rejected_In_Progress'], 
    default: 'In_Progress' 
  }
});

const orderSchema = new mongoose.Schema({
  gigID: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  image: { type: String, required: false },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  sellerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isCompleted: { type: Boolean, default: false },
  payment_intent: { type: String, required: true },
  readBySeller: { type: Boolean, default: false, required: true },
  readByBuyer: { type: Boolean, default: true, required: true },
  deliveryTime: { type: Number, default: 1, required: true }, 
  extendedDays: { type: Number, default: 0 },                  
  milestones: [milestoneSchema]                                
}, {
  versionKey: false,
  timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);
