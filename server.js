const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Hardcoded Data (Moved from frontend)
const PRODUCTS = [
    {
        id: "x500",
        name: "Elite Strike X-500",
        price: 79.99,
        img: "images/elitestrike.png"
    },
    {
        id: "pro",
        name: "Tactical Blaster Pro",
        price: 49.99,
        img: "images/tacticalpro.png"
    },
    {
        id: "ammo1",
        name: "Foam Dart Pack (50)",
        price: 19.99,
        img: "images/dart_50.png"
    },
    {
        id: "ammo2",
        name: "Mega Dart Pack (100)",
        price: 29.99,
        img: "images/dart_100.png"
    },
    {
        id: "pistol",
        name: "Rapid Fire Pistol",
        price: 34.99,
        img: "images/rapidfirepistol.png"
    },
    {
        id: "bundle",
        name: "Ultimate Arsenal Bundle (Christmas Special)",
        price: 99,
        originalPrice: 200,
        img: "images/bundle.png"
    }
];

// API Endpoints

// Get all products
app.get('/api/products', (req, res) => {
    res.json(PRODUCTS);
});

// Handle contact form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('Contact Form Receipt:', { name, email, message });
    // In a real app, you would send an email or save to DB here
    res.status(200).json({ message: "Message received successfully" });
});

// Handle feedback form (Thank You page)
app.post('/api/feedback', (req, res) => {
    const feedbackData = req.body;
    console.log('Feedback Received:', feedbackData);

    const feedbackText = `
=========================================
Date: ${feedbackData.date}
Email: ${feedbackData.email}
Mobile: ${feedbackData.mobile}
Message: ${feedbackData.message}
=========================================
`;

    const filePath = path.join(__dirname, 'feedback.txt');
    fs.appendFile(filePath, feedbackText, (err) => {
        if (err) {
            console.error("Failed to save feedback:", err);
        } else {
            console.log("Feedback saved to feedback.txt");
        }
    });

    res.status(200).json({ message: "Feedback received successfully" });
});

// Handle orders
app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    console.log('Order Received:', orderData);

    // Format order for text file
    const orderText = `
=========================================
Order ID: ${orderData.id}
Date: ${orderData.date}
Customer: ${orderData.customer.name} (${orderData.customer.email})
Address: ${orderData.customer.address}
Items:
${orderData.items.map(item => ` - ${item.name} ($${item.price})`).join('\n')}
Total: $${orderData.total}
=========================================
`;

    // Append to orders.txt
    const filePath = path.join(__dirname, 'orders.txt');
    fs.appendFile(filePath, orderText, (err) => {
        if (err) {
            console.error("Failed to save order to file:", err);
            // Still return success to frontend as order is processed in memory/logs
        } else {
            console.log("Order saved to orders.txt");
        }
    });

    res.status(201).json({ message: "Order placed successfully", orderId: orderData.id });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
