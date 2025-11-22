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
const locationRoutes = require('./routes/location.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const superadminRoutes = require('./routes/superadmin.routes');
// const publicRoutes = require('./routes/public.routes');
// const errorMiddleware = require('./middlewares/error.middleware');

// customer routes can be added here
const homeRoutes = require('./routes/home.routes');
const customerBranchRoutes =  require("./routes/customer-branch.routes");
const customerBookingRoutes =  require("./routes/customer-booking.routes");
const customerAuthRoutes = require("./routes/customer.auth.routes.js");


connect();
const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
// app.use('/uploads', express.static(path.join(__dirname, '..', UPLOAD_DIR)));

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/salon', salonRoutes);
app.use('/api/admin/location', locationRoutes);
app.use('/api/admin/service', serviceRoutes);
app.use('/api/admin/booking', bookingRoutes);
app.use("/api/admin/dashboard",dashboardRoutes);
// superadmin routes
app.use("/api/superadmin",superadminRoutes);
// app.use('/api/admin/public', publicRoutes);

// customer routes can be added here    
app.use('/api/customer', homeRoutes);
app.use("/api/customer/branch",customerBranchRoutes);
app.use('/api/customer/booking', customerBookingRoutes);
app.use('/api/customer/auth',customerAuthRoutes);


app.get('/health', (req, res) => res.json({ ok: true }));

// app.use(errorMiddleware);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});