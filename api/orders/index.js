import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const db = require('../../src/data/db.json');

function generateTransactionId() {
  return 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(db.orders);
  } else if (req.method === 'POST') {
    const newOrder = {
      ...req.body,
      id: Date.now(),
      orderStatus: 'Processing',
      orderDate: new Date().toISOString(),
      paymentStatus: 'paid',
      paymentMethod: req.body?.data?.paymentType || 'credit-card',
      transactionId: generateTransactionId(),
    };
    res.status(201).json(newOrder);
  } else {
    res.status(405).end();
  }
}
