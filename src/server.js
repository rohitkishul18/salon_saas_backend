// server.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const salonRoutes = require('./routes/salon.routes');
const locationRoutes = require('./routes/location.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const superadminRoutes = require('./routes/superadmin.routes');

// Customer routes
const homeRoutes = require('./routes/home.routes');
const customerBranchRoutes = require('./routes/customer-branch.routes');
const customerBookingRoutes = require('./routes/customer-booking.routes');
const customerAuthRoutes = require('./routes/customer.auth.routes');
const customerSalonRoutes = require('./routes/customer-salon.routes');
const errorHandler = require('./middlewares/error.middleware');

// Connect DB
connectDB();

// Express app
const app = express();

// -----------------------------------
// 🔐 SECURITY (Only for production)
// -----------------------------------
// if (process.env.NODE_ENV === 'production') {
//     app.use(helmet());             
//     app.use(compression());    
// }

const corsOptions = {
    origin: ['http://localhost:4200','http://localhost:62511'],   // ADD YOUR FRONTEND URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
 
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // FIX PRE-FLIGHT ISSUES

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// salon-owner / admin routes

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/salon', salonRoutes);
app.use('/api/admin/location', locationRoutes);
app.use('/api/admin/service', serviceRoutes);
app.use('/api/admin/booking', bookingRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
// Superadmin routes
app.use("/api/superadmin", superadminRoutes);

// Customer routes
app.use('/api/customer', homeRoutes);
app.use("/api/customer/branch", customerBranchRoutes);
app.use('/api/customer/booking', customerBookingRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api/customer/salon', customerSalonRoutes);

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));


app.use(errorHandler);

// -----------------------------------
// 🟢 Start Server
// -----------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
