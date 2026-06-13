const express = require('express');
const { userMiddleware } = require('../middlewares');
const { 
  getOrders, 
  createOrder, 
  markOrdersAsRead, 
  submitMilestone, 
  reviewMilestone, 
  extendOrderTime 
} = require('../controllers/order.controller');

const app = express.Router();

app.get('/', userMiddleware, getOrders);
app.put('/mark-as-read', userMiddleware, markOrdersAsRead);
app.post('/milestone/submit', userMiddleware, submitMilestone);
app.post('/milestone/review', userMiddleware, reviewMilestone);
app.post('/milestone/extend', userMiddleware, extendOrderTime);
app.post('/:id', userMiddleware, createOrder);

module.exports = app;
