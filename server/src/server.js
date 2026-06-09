const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer'); 
const path = require('path'); 
const connect = require('./configs/db');
const PORT = 8080;

// Other Route files
const { userRoute, conversationRoute, gigRoute, messageRoute, orderRoute, reviewRoute, 
authRoute } = require('./routes');

// App
const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(cors({
origin: ['http://localhost:5173', 'http://localhost:4173', 'https://netlify.app'],
credentials: true
}));

// ИСПРАВЛЕНО ДЛЯ ВКР: Безопасный абсолютный путь к папке uploads из корня бэкенда
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')));

// НАСТРОЙКА SMTP-ТРАНСПОРТА ДЛЯ MAIL.RU
const transporter = nodemailer.createTransport({
host: 'smtp.mail.ru',
port: 465,
secure: true, 
auth: {
user: 'tarnaola00@mail.ru', 
pass: 'dDBg9en7kaWoLCFejsFf' 
}
});

// ЭНДПОИНТ ОТПРАВКИ ПИСЕМ ИЗ ФОРМЫ ТЕХПОДДЕРЖКИ
app.post('/api/support/send-email', async (request, response) => {
const { userEmail, subject, message, adminEmail } = request.body;
if (!userEmail || !subject || !message) {
return response.status(400).send({ message: 'Пожалуйста, заполните все поля' });
}
const mailOptions = {
from: '"FreelancePF Поддержка" <tarnaola00@mail.ru>', 
to: adminEmail || 'tarnaola001@gmail.com', 
subject: ` Обращение в техподдержку: ${subject}`,
html: `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
<h2 style="color: #0D084D; border-bottom: 2px solid #1dbf73; padding-bottom: 10px;">Новое обращение на платформе FreelancePF</h2>
<p><strong>Email пользователя для связи:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
<p><strong>Тема обращения:</strong> ${subject}</p>
<div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1dbf73; margin-top: 15px; border-radius: 4px;">
<p style="margin: 0; font-style: italic; line-height: 1.6;">${message}</p>
</div>
<hr style="border: 0; border-top: 1px solid #eee; margin-top: 25px;" />
<p style="font-size: 12px; color: #999; text-align: center;">Это автоматическое системное уведомление вашей дипломной работы ВКР.</p>
</div>
`
};
try {
await transporter.sendMail(mailOptions);
return response.status(200).send({ message: 'Письмо успешно отправлено!' });
} catch (error) {
console.error('Ошибка Nodemailer:', error);
return response.status(500).send({ 
message: 'Ошибка при отправке письма на сервере', 
error: error.message 
});
}
});

// Other Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/gigs', gigRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/orders', orderRoute);
app.use('/api/messages', messageRoute);
app.use('/api/reviews', reviewRoute);

app.get('/', (request, response) => {
response.send('Hello, Topper!');
});

app.get('/ip', (request, response) => {
const list = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
const ips = list.split(',');
return response.send({ ip: ips });
});

app.listen(PORT, async () => {
try {
await connect();
console.log(`Listening at http://localhost:${PORT}`);
}
catch ({ message }) {
console.log(message);
}
});

module.exports = app;
