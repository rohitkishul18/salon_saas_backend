const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const connect = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const salonRoutes = require('./routes/salon.routes');
// const locationRoutes = require('./routes/location.routes');
// const serviceRoutes = require('./routes/service.routes');
// const bookingRoutes = require('./routes/booking.routes');
// const publicRoutes = require('./routes/public.routes');
// const errorMiddleware = require('./middlewares/error.middleware');


connect();

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
// app.use('/uploads', express.static(path.join(__dirname, '..', UPLOAD_DIR)));

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/salon', salonRoutes);
// app.use('/api/admn/location', locationRoutes);
// app.use('/api/admin/service', serviceRoutes);
// app.use('/api/admin/booking', bookingRoutes);
// app.use('/api/admin/public', publicRoutes);



app.get('/health', (req, res) => res.json({ ok: true }));

// app.use(errorMiddleware);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});