const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || '/data/data.json';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
let data = {
  testDrives: [],
  quotes: [],
  serviceBookings: [],
  inquiries: [],
  newsletter: []
};

// Load existing data
if (fs.existsSync(DB_PATH)) {
  try {
    data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save data function
const saveData = () => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Sevoke Motors API is running',
    timestamp: new Date().toISOString()
  });
});

// Car models data
const carModels = {
  arena: [
    {
      id: 'swift',
      name: 'Swift',
      price: '599000',
      image: '/images/swift.jpg',
      type: 'Hatchback',
      fuel: 'Petrol/CNG',
      mileage: '23.20 km/l',
      features: ['Dual Airbags', 'ABS with EBD', 'Smart Play Studio']
    },
    {
      id: 'baleno',
      name: 'Baleno',
      price: '649000',
      image: '/images/baleno.jpg',
      type: 'Hatchback',
      fuel: 'Petrol/CNG',
      mileage: '22.94 km/l',
      features: ['6 Airbags', 'ESP', '9" Smart Play Pro+']
    },
    {
      id: 'brezza',
      name: 'Brezza',
      price: '849000',
      image: '/images/brezza.jpg',
      type: 'SUV',
      fuel: 'Petrol/CNG',
      mileage: '20.15 km/l',
      features: ['6 Airbags', 'ESP', 'Hill Hold Assist']
    }
  ],
  nexa: [
    {
      id: 'ciaz',
      name: 'Ciaz',
      price: '949000',
      image: '/images/ciaz.jpg',
      type: 'Sedan',
      fuel: 'Petrol/CNG',
      mileage: '21.56 km/l',
      features: ['6 Airbags', 'Cruise Control', 'LED Headlamps']
    },
    {
      id: 'xl6',
      name: 'XL6',
      price: '1249000',
      image: '/images/xl6.jpg',
      type: 'MPV',
      fuel: 'Petrol/CNG',
      mileage: '20.97 km/l',
      features: ['Captain Seats', 'Smart Play Pro+', 'Cruise Control']
    }
  ]
};

// API Routes

// Get all car models
app.get('/api/cars', (req, res) => {
  res.json({ status: 'success', data: carModels });
});

// Get specific car model
app.get('/api/cars/:category/:id', (req, res) => {
  const { category, id } = req.params;
  const cars = carModels[category];
  
  if (!cars) {
    return res.status(404).json({ status: 'error', message: 'Category not found' });
  }
  
  const car = cars.find(c => c.id === id);
  if (!car) {
    return res.status(404).json({ status: 'error', message: 'Car not found' });
  }
  
  res.json({ status: 'success', data: car });
});

// Book test drive
app.post('/api/test-drive', (req, res) => {
  const { name, phone, email, carModel, preferredDate, preferredTime, message } = req.body;
  
  if (!name || !phone || !carModel) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  
  const booking = {
    id: Date.now().toString(),
    name,
    phone,
    email: email || '',
    carModel,
    preferredDate: preferredDate || '',
    preferredTime: preferredTime || '',
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  data.testDrives.push(booking);
  saveData();
  
  res.json({ status: 'success', message: 'Test drive booked successfully', data: booking });
});

// Request quote
app.post('/api/quote', (req, res) => {
  const { name, phone, email, carModel, variant, exchangeCar, message } = req.body;
  
  if (!name || !phone || !carModel) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  
  const quote = {
    id: Date.now().toString(),
    name,
    phone,
    email: email || '',
    carModel,
    variant: variant || '',
    exchangeCar: exchangeCar || '',
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  data.quotes.push(quote);
  saveData();
  
  res.json({ status: 'success', message: 'Quote request submitted successfully', data: quote });
});

// Book service
app.post('/api/service', (req, res) => {
  const { name, phone, email, carModel, regNumber, serviceType, preferredDate, message } = req.body;
  
  if (!name || !phone || !carModel || !serviceType) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  
  const booking = {
    id: Date.now().toString(),
    name,
    phone,
    email: email || '',
    carModel,
    regNumber: regNumber || '',
    serviceType,
    preferredDate: preferredDate || '',
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  data.serviceBookings.push(booking);
  saveData();
  
  res.json({ status: 'success', message: 'Service booked successfully', data: booking });
});

// General inquiry
app.post('/api/inquiry', (req, res) => {
  const { name, phone, email, subject, message } = req.body;
  
  if (!name || !phone || !message) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  
  const inquiry = {
    id: Date.now().toString(),
    name,
    phone,
    email: email || '',
    subject: subject || '',
    message,
    status: 'new',
    createdAt: new Date().toISOString()
  };
  
  data.inquiries.push(inquiry);
  saveData();
  
  res.json({ status: 'success', message: 'Inquiry submitted successfully', data: inquiry });
});

// Newsletter subscription
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ status: 'error', message: 'Email is required' });
  }
  
  // Check if email already exists
  const existing = data.newsletter.find(sub => sub.email === email);
  if (existing) {
    return res.status(400).json({ status: 'error', message: 'Email already subscribed' });
  }
  
  const subscription = {
    id: Date.now().toString(),
    email,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  data.newsletter.push(subscription);
  saveData();
  
  res.json({ status: 'success', message: 'Subscribed to newsletter successfully' });
});

// EMI Calculator
app.post('/api/emi-calculator', (req, res) => {
  const { carPrice, downPayment, loanTerm, interestRate } = req.body;
  
  if (!carPrice || !loanTerm || !interestRate) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  
  const principal = parseFloat(carPrice) - parseFloat(downPayment || 0);
  const monthlyRate = parseFloat(interestRate) / 12 / 100;
  const months = parseInt(loanTerm) * 12;
  
  let emi = 0;
  if (monthlyRate > 0) {
    emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  } else {
    emi = principal / months;
  }
  
  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;
  
  res.json({
    status: 'success',
    data: {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principal: Math.round(principal)
    }
  });
});

// Get company info
app.get('/api/company-info', (req, res) => {
  const info = {
    name: 'Sevoke Motors',
    address: 'Sevoke Road, Siliguri, West Bengal 734001',
    phone: '+91-353-2345678',
    whatsapp: '+91-9876543210',
    email: 'info@sevokemotors.com',
    hours: {
      weekdays: '9:00 AM - 7:00 PM',
      sunday: '10:00 AM - 6:00 PM'
    },
    services: [
      'New Car Sales (Arena & Nexa)',
      'Pre-owned Cars (True Value)',
      'Commercial Vehicles',
      'Service & Repairs',
      'Genuine Parts',
      'Insurance Services',
      'Finance Assistance'
    ]
  };
  
  res.json({ status: 'success', data: info });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Sevoke Motors server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
});