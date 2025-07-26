// Export utilities for analytics data

export const exportToCsv = (data: any[], filename: string) => {
  if (!data.length) return;

  // Get all unique keys from the data
  const keys = Array.from(new Set(data.flatMap(Object.keys)));
  
  // Create CSV content
  const csvContent = [
    // Header row
    keys.join(','),
    // Data rows
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPdf = async (data: any[], title: string, filename: string) => {
  // For PDF export, we'll create a simple HTML table and use the browser's print functionality
  // In a production environment, you might want to use a library like jsPDF or Puppeteer
  
  if (!data.length) return;

  const keys = Array.from(new Set(data.flatMap(Object.keys)));
  
  // Create HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${keys.map(key => `<th>${key}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${keys.map(key => `<td>${row[key] ?? ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total records: ${data.length}</p>
        </div>
      </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      // Close window after printing (user can cancel this)
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  }
};

export const exportToJson = (data: any[], filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Utility to format data for export (normalize dates, numbers, etc.)
export const formatDataForExport = (data: any[]) => {
  return data.map(row => {
    const formattedRow: any = {};
    
    Object.entries(row).forEach(([key, value]) => {
      if (value instanceof Date) {
        formattedRow[key] = value.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      } else if (typeof value === 'number') {
        formattedRow[key] = Number.isInteger(value) ? value : Number(value.toFixed(2));
      } else {
        formattedRow[key] = value;
      }
    });
    
    return formattedRow;
  });
};