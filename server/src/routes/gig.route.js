const express = require('express');
const multer = require('multer');
const path = require('path');
const { createGig, deleteGig, getGig, getGigs } = require('../controllers/gig.controller');
const { userMiddleware } = require('../middlewares');

const app = express.Router();

// Настройка локального дискового хранилища для вашей документации ВКР
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); 
    },
    filename: (req, file, cb) => {
        // Защита от перезаписи: текущее время + оригинальное расширение файла
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// Новый неубиваемый эндпоинт, который работает без интернета в любой аудитории вуза
app.post('/upload-local', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send({ message: 'Файл не был загружен' });
    
    // Динамическая сборка ссылки (подстроится как под localhost, так и под любой хостинг в будущем)
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    
    res.status(200).send({ url: fileUrl });
});

// Стандартная CRUD-логика каталога
app.post('/', userMiddleware, createGig);
app.delete('/:_id', userMiddleware, deleteGig);
app.get('/single/:_id', getGig);
app.get('/', getGigs);

module.exports = app;
