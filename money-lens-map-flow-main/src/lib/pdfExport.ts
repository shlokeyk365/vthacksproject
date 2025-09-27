import jsPDF from 'jspdf';

interface ExportData {
  version: string;
  exportedAt: string;
  user: {
    profile: {
      email: string;
      firstName: string;
      lastName: string;
      monthlyBudgetGoal: number | null;
      preferences: any;
      twoFactorEnabled: boolean;
      createdAt: string;
      updatedAt: string;
    };
    transactions: Array<{
      id: string;
      merchant: string;
      amount: number;
      category: string;
      description: string | null;
      location: string | null;
      latitude: number | null;
      longitude: number | null;
      date: string;
      status: string;
      isSimulated: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    spendingCaps: Array<{
      id: string;
      type: string;
      name: string;
      limit: number;
      period: string;
      enabled: boolean;
      category: string | null;
      merchant: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      createdAt: string;
    }>;
  };
}

export function generatePDFExport(data: ExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  const lineHeight = 7;
  const margin = 20;

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, maxWidth?: number) => {
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * lineHeight);
    } else {
      doc.text(text, x, y);
      return y + lineHeight;
    }
  };

  // Helper function to add a new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('MoneyLens Data Export', margin, yPosition);
  
  yPosition += 10;
  
  // Export info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  yPosition = addText(`Exported on: ${new Date(data.exportedAt).toLocaleDateString()}`, margin, yPosition);
  yPosition = addText(`Version: ${data.version}`, margin, yPosition);
  
  yPosition += 15;

  // User Profile Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText('User Profile', margin, yPosition);
  
  yPosition += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const profile = data.user.profile;
  yPosition = addText(`Name: ${profile.firstName} ${profile.lastName}`, margin, yPosition);
  yPosition = addText(`Email: ${profile.email}`, margin, yPosition);
  yPosition = addText(`Monthly Budget Goal: $${profile.monthlyBudgetGoal || 'Not set'}`, margin, yPosition);
  yPosition = addText(`Two-Factor Authentication: ${profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}`, margin, yPosition);
  yPosition = addText(`Account Created: ${new Date(profile.createdAt).toLocaleDateString()}`, margin, yPosition);
  
  yPosition += 15;

  // Transactions Section
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText(`Transactions (${data.user.transactions.length})`, margin, yPosition);
  
  yPosition += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (data.user.transactions.length === 0) {
    yPosition = addText('No transactions found.', margin, yPosition);
  } else {
    // Add transaction headers
    doc.setFont('helvetica', 'bold');
    yPosition = addText('Date | Merchant | Amount | Category | Status', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    
    data.user.transactions.slice(0, 20).forEach((transaction) => {
      checkNewPage(15);
      const date = new Date(transaction.date).toLocaleDateString();
      const amount = `$${transaction.amount.toFixed(2)}`;
      const status = transaction.isSimulated ? 'Simulated' : 'Real';
      const line = `${date} | ${transaction.merchant} | ${amount} | ${transaction.category} | ${status}`;
      yPosition = addText(line, margin, yPosition, pageWidth - 2 * margin);
    });
    
    if (data.user.transactions.length > 20) {
      yPosition += 5;
      yPosition = addText(`... and ${data.user.transactions.length - 20} more transactions`, margin, yPosition);
    }
  }
  
  yPosition += 15;

  // Spending Caps Section
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText(`Spending Caps (${data.user.spendingCaps.length})`, margin, yPosition);
  
  yPosition += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (data.user.spendingCaps.length === 0) {
    yPosition = addText('No spending caps found.', margin, yPosition);
  } else {
    data.user.spendingCaps.forEach((cap) => {
      checkNewPage(20);
      yPosition = addText(`• ${cap.name}`, margin, yPosition);
      yPosition = addText(`  Type: ${cap.type} | Limit: $${cap.limit} | Period: ${cap.period}`, margin, yPosition);
      yPosition = addText(`  Status: ${cap.enabled ? 'Enabled' : 'Disabled'}`, margin, yPosition);
      if (cap.category) yPosition = addText(`  Category: ${cap.category}`, margin, yPosition);
      if (cap.merchant) yPosition = addText(`  Merchant: ${cap.merchant}`, margin, yPosition);
      yPosition += 5;
    });
  }
  
  yPosition += 15;

  // Notifications Section
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = addText(`Notifications (${data.user.notifications.length})`, margin, yPosition);
  
  yPosition += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (data.user.notifications.length === 0) {
    yPosition = addText('No notifications found.', margin, yPosition);
  } else {
    data.user.notifications.slice(0, 10).forEach((notification) => {
      checkNewPage(20);
      yPosition = addText(`• ${notification.title}`, margin, yPosition);
      yPosition = addText(`  ${notification.message}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition = addText(`  Type: ${notification.type} | Read: ${notification.read ? 'Yes' : 'No'}`, margin, yPosition);
      yPosition = addText(`  Date: ${new Date(notification.createdAt).toLocaleDateString()}`, margin, yPosition);
      yPosition += 5;
    });
    
    if (data.user.notifications.length > 10) {
      yPosition += 5;
      yPosition = addText(`... and ${data.user.notifications.length - 10} more notifications`, margin, yPosition);
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
  }

  // Download the PDF
  const fileName = `moneylens-export-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
