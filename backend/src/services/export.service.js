const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ExportService {
  
  // Export to CSV
  async exportToCSV(data, filename, headers) {
    try {
      let csvContent = '';
      
      // Add headers
      if (headers) {
        csvContent += headers.join(',') + '\n';
      }
      
      // Add data rows
      data.forEach(row => {
        const values = Object.values(row).map(value => {
          // Handle special characters and commas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csvContent += values.join(',') + '\n';
      });

      const filePath = path.join(__dirname, '../../exports', `${filename}.csv`);
      
      // Ensure exports directory exists
      const exportsDir = path.dirname(filePath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      fs.writeFileSync(filePath, csvContent);
      
      return {
        success: true,
        filePath,
        filename: `${filename}.csv`
      };
    } catch (error) {
      console.error('CSV export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Export to Excel
  async exportToExcel(data, filename, sheetName = 'Sheet1', headers) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Add headers if provided
      if (headers) {
        worksheet.addRow(headers);
        // Style headers
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }

      // Add data rows
      data.forEach(row => {
        const values = headers ? headers.map(header => row[header] || '') : Object.values(row);
        worksheet.addRow(values);
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      const filePath = path.join(__dirname, '../../exports', `${filename}.xlsx`);
      
      // Ensure exports directory exists
      const exportsDir = path.dirname(filePath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      await workbook.xlsx.writeFile(filePath);

      return {
        success: true,
        filePath,
        filename: `${filename}.xlsx`
      };
    } catch (error) {
      console.error('Excel export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Export to PDF
  async exportToPDF(data, filename, title, headers) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filePath = path.join(__dirname, '../../exports', `${filename}.pdf`);
      
      // Ensure exports directory exists
      const exportsDir = path.dirname(filePath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      doc.pipe(fs.createWriteStream(filePath));

      // Add title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();

      // Add generation date
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      // Calculate column widths
      const pageWidth = doc.page.width - 100; // Account for margins
      const columnWidth = pageWidth / headers.length;

      // Add table headers
      let yPosition = doc.y;
      doc.fontSize(12).fillColor('black');
      
      headers.forEach((header, index) => {
        doc.rect(50 + (index * columnWidth), yPosition, columnWidth, 25)
           .fillAndStroke('#f0f0f0', '#000000');
        doc.fillColor('black')
           .text(header, 55 + (index * columnWidth), yPosition + 8, {
             width: columnWidth - 10,
             align: 'center'
           });
      });

      yPosition += 25;

      // Add data rows
      data.forEach((row, rowIndex) => {
        if (yPosition > doc.page.height - 100) {
          doc.addPage();
          yPosition = 50;
        }

        headers.forEach((header, colIndex) => {
          const value = row[header] || '';
          doc.rect(50 + (colIndex * columnWidth), yPosition, columnWidth, 20)
             .stroke('#cccccc');
          doc.fillColor('black')
             .fontSize(10)
             .text(value.toString(), 55 + (colIndex * columnWidth), yPosition + 5, {
               width: columnWidth - 10,
               align: 'left'
             });
        });

        yPosition += 20;
      });

      doc.end();

      return {
        success: true,
        filePath,
        filename: `${filename}.pdf`
      };
    } catch (error) {
      console.error('PDF export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Export revenue report
  async exportRevenueReport(reportData, format = 'excel') {
    const filename = `revenue_report_${Date.now()}`;
    const headers = ['Date', 'Hostel', 'Payment Type', 'Amount', 'Status'];
    
    const data = reportData.map(item => ({
      'Date': new Date(item.createdAt).toLocaleDateString(),
      'Hostel': item.hostelName || 'N/A',
      'Payment Type': item.paymentType || 'N/A',
      'Amount': `₹${item.amount}`,
      'Status': item.status
    }));

    switch (format) {
      case 'csv':
        return await this.exportToCSV(data, filename, headers);
      case 'pdf':
        return await this.exportToPDF(data, filename, 'Revenue Report', headers);
      default:
        return await this.exportToExcel(data, filename, 'Revenue Report', headers);
    }
  }

  // Export student report
  async exportStudentReport(students, format = 'excel') {
    const filename = `students_report_${Date.now()}`;
    const headers = ['Name', 'Email', 'Mobile', 'Hostel', 'Room', 'Check-in Date', 'Status'];
    
    const data = students.map(student => ({
      'Name': student.name,
      'Email': student.email,
      'Mobile': student.mobile,
      'Hostel': student.hostel?.name || 'N/A',
      'Room': student.room?.roomNumber || 'N/A',
      'Check-in Date': student.checkInDate ? new Date(student.checkInDate).toLocaleDateString() : 'N/A',
      'Status': student.status
    }));

    switch (format) {
      case 'csv':
        return await this.exportToCSV(data, filename, headers);
      case 'pdf':
        return await this.exportToPDF(data, filename, 'Students Report', headers);
      default:
        return await this.exportToExcel(data, filename, 'Students Report', headers);
    }
  }

  // Export maintenance report
  async exportMaintenanceReport(maintenanceData, format = 'excel') {
    const filename = `maintenance_report_${Date.now()}`;
    const headers = ['Request ID', 'Category', 'Priority', 'Status', 'Created Date', 'Completed Date', 'Cost'];
    
    const data = maintenanceData.map(item => ({
      'Request ID': item._id,
      'Category': item.category,
      'Priority': item.priority,
      'Status': item.status,
      'Created Date': new Date(item.createdAt).toLocaleDateString(),
      'Completed Date': item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'N/A',
      'Cost': item.actualCost ? `₹${item.actualCost}` : 'N/A'
    }));

    switch (format) {
      case 'csv':
        return await this.exportToCSV(data, filename, headers);
      case 'pdf':
        return await this.exportToPDF(data, filename, 'Maintenance Report', headers);
      default:
        return await this.exportToExcel(data, filename, 'Maintenance Report', headers);
    }
  }

  // Clean up old export files
  async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const exportsDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportsDir)) return;

      const files = fs.readdirSync(exportsDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(exportsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old export file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new ExportService();