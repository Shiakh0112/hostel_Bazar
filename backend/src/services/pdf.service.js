const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  static async generateInvoicePDF(invoice, student, hostel) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `invoice-${invoice.invoiceNumber}.pdf`;
        const filepath = path.join(process.cwd(), 'uploads', 'invoices', filename);
        
        // Ensure directory exists
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('INVOICE', 50, 50);
        doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`, 400, 50);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 400, 70);
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 90);

        // Hostel Info
        doc.fontSize(14).text('From:', 50, 130);
        doc.fontSize(12).text(hostel.name, 50, 150);
        doc.text(hostel.address || 'Hostel Address', 50, 170);

        // Student Info
        doc.fontSize(14).text('To:', 300, 130);
        doc.fontSize(12).text(student.name, 300, 150);
        doc.text(student.email, 300, 170);

        // Invoice Details
        doc.fontSize(14).text(`Invoice for: ${invoice.month}/${invoice.year}`, 50, 220);
        
        // Items Table
        let yPosition = 260;
        doc.fontSize(12).text('Description', 50, yPosition);
        doc.text('Amount', 450, yPosition);
        doc.moveTo(50, yPosition + 15).lineTo(550, yPosition + 15).stroke();
        
        yPosition += 30;
        invoice.items.forEach(item => {
          doc.text(item.description, 50, yPosition);
          doc.text(`₹${item.amount}`, 450, yPosition);
          yPosition += 20;
        });

        // Totals
        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 20;
        
        doc.text('Subtotal:', 350, yPosition);
        doc.text(`₹${invoice.subtotal}`, 450, yPosition);
        yPosition += 20;
        
        if (invoice.discount > 0) {
          doc.text('Discount:', 350, yPosition);
          doc.text(`-₹${invoice.discount}`, 450, yPosition);
          yPosition += 20;
        }
        
        if (invoice.lateFee > 0) {
          doc.text('Late Fee:', 350, yPosition);
          doc.text(`₹${invoice.lateFee}`, 450, yPosition);
          yPosition += 20;
        }
        
        doc.fontSize(14).text('Total Amount:', 350, yPosition);
        doc.text(`₹${invoice.totalAmount}`, 450, yPosition);

        // Footer
        doc.fontSize(10).text('Thank you for your payment!', 50, 700);
        
        doc.end();
        
        stream.on('finish', () => {
          resolve(`/uploads/invoices/${filename}`);
        });
        
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async generatePaymentReceipt(payment, student, hostel) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `receipt-${payment._id}.pdf`;
        const filepath = path.join(process.cwd(), 'uploads', 'receipts', filename);
        
        // Ensure directory exists
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('PAYMENT RECEIPT', 50, 50);
        doc.fontSize(12).text(`Receipt #: ${payment._id}`, 400, 50);
        doc.text(`Date: ${new Date(payment.paidAt).toLocaleDateString()}`, 400, 70);

        // Hostel Info
        doc.fontSize(14).text('From:', 50, 130);
        doc.fontSize(12).text(hostel.name, 50, 150);

        // Student Info
        doc.fontSize(14).text('Received from:', 300, 130);
        doc.fontSize(12).text(student.name, 300, 150);
        doc.text(student.email, 300, 170);

        // Payment Details
        doc.fontSize(14).text('Payment Details:', 50, 220);
        doc.fontSize(12).text(`Payment Type: ${payment.paymentType}`, 50, 250);
        doc.text(`Amount: ₹${payment.amount}`, 50, 270);
        doc.text(`Payment Method: ${payment.paymentMethod}`, 50, 290);
        doc.text(`Status: ${payment.status}`, 50, 310);
        
        if (payment.razorpayPaymentId) {
          doc.text(`Transaction ID: ${payment.razorpayPaymentId}`, 50, 330);
        }

        // Footer
        doc.fontSize(10).text('This is a computer generated receipt.', 50, 700);
        
        doc.end();
        
        stream.on('finish', () => {
          resolve(`/uploads/receipts/${filename}`);
        });
        
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFService;