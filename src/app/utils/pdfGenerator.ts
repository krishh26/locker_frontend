import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import jsonData from 'src/url.json';

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

export interface FormSubmissionData {
  formName: string;
  description?: string;
  submittedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  submissionDate: string;
  formData: { [key: string]: any };
  fields: Array<{
    id: string;
    type: string;
    label: string;
    required?: boolean;
    options?: { label: string; value: string }[];
  }>;
}

export const generateFormSubmissionPDF = async (data: FormSubmissionData): Promise<Blob> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, contentWidth);
    
    // Check if we need a new page
    if (yPosition + (lines.length * fontSize * 0.35) > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.35 + 5;
  };

  // Add header
  addText('FORM SUBMISSION REPORT', 18, true);
  yPosition += 5;

  // Add form details
  addText(`Form Name: ${data.formName}`, 14, true);
  
  if (data.description) {
    addText(`Description: ${data.description}`, 12);
  }

  addText(`Submission Date: ${data.submissionDate}`, 12);
  addText(`Submitted By: ${data.submittedBy.name}`, 12);
  addText(`Email: ${data.submittedBy.email}`, 12);
  
  if (data.submittedBy.phone) {
    addText(`Phone: ${data.submittedBy.phone}`, 12);
  }

  yPosition += 10;
  addText('FORM RESPONSES', 16, true);
  yPosition += 5;

  // Add form responses
  data.fields.forEach((field) => {
    const value = data.formData[field.id];
    
    if (value !== undefined && value !== null && value !== '') {
      // Field label
      addText(`${field.label}${field.required ? ' *' : ''}:`, 12, true);
      
      // Field value
      let displayValue = '';
      
      switch (field.type) {
        case 'checkbox':
          if (Array.isArray(value) && value.length > 0) {
            displayValue = value.join(', ');
          } else {
            displayValue = 'No selections';
          }
          break;
        case 'radio':
        case 'select':
          // Find the label for the selected value
          const selectedOption = field.options?.find(opt => opt.value === value);
          displayValue = selectedOption ? selectedOption.label : value;
          break;
        case 'file':
          if (value instanceof File) {
            displayValue = `File uploaded: ${value.name} (${(value.size / 1024).toFixed(2)} KB)`;
          } else {
            displayValue = 'File uploaded';
          }
          break;
        default:
          displayValue = String(value);
          break;
      }
      
      addText(displayValue, 11);
      yPosition += 5;
    }
  });

  // Add footer
  yPosition += 10;
  addText('This is an automatically generated report.', 10);
  addText(`Generated on: ${new Date().toLocaleString()}`, 10);

  return pdf.output('blob');
};

export const generateFormSubmissionPDFFromHTML = async (
  elementId: string,
  formData: FormSubmissionData
): Promise<Blob> => {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with ID '${elementId}' not found`);
  }

  try {
    // Temporarily hide any buttons or interactive elements for PDF
    const buttons = element.querySelectorAll('button');
    const originalDisplay: string[] = [];
    buttons.forEach((button, index) => {
      originalDisplay[index] = button.style.display;
      button.style.display = 'none';
    });

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      logging: false,
      removeContainer: true,
    });

    // Restore button visibility
    buttons.forEach((button, index) => {
      button.style.display = originalDisplay[index];
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    
    // Calculate image dimensions to fit page
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add header with form info
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Form Submission Report', margin, margin);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Submitted by: ${formData.submittedBy.name}`, margin, margin + 10);
    pdf.text(`Date: ${formData.submissionDate}`, margin, margin + 20);
    
    // Add the form image
    let yPosition = margin + 35;
    
    if (imgHeight > pageHeight - yPosition - margin) {
      // If image is too tall, split across pages
      const availableHeight = pageHeight - yPosition - margin;
      const scaleFactor = availableHeight / imgHeight;
      const scaledHeight = imgHeight * scaleFactor;
      const scaledWidth = imgWidth * scaleFactor;
      
      pdf.addImage(imgData, 'PNG', margin, yPosition, scaledWidth, scaledHeight);
    } else {
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    }

    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    // Fallback to text-based PDF
    return generateFormSubmissionPDF(formData);
  }
};

export const sendFormSubmissionEmail = async (
  pdfBlob: Blob,
  formId: string,
  userIds: string[],
  authToken: string
): Promise<boolean> => {
  try {
    console.log('Preparing to send email with PDF...', {
      formId,
      userIds,
      pdfSize: pdfBlob.size,
    });

    const formData = new FormData();
    formData.append('pdf', pdfBlob, `form_submission_${formId}_${Date.now()}.pdf`);
    formData.append('form_id', formId);

    // userIds.forEach((userId, index) => {
    //   formData.append(`user_ids[${index}]`, userId);
    // });
    formData.append('user_ids[0]', '7');
    console.log('Sending request to /api/v1/form/send-assignment-email...');

    const response = await fetch(`${URL_BASE_LINK}/form/send-assignment-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VyX25hbWUiOiJhZG1pbiIsImZpcnN0X25hbWUiOiJqZWVsIiwibGFzdF9uYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsIm1vYmlsZSI6Iis5MTg0ODc4MjM2MDciLCJyb2xlcyI6WyJUcmFpbmVyIiwiSVFBIiwiRVFBIiwiTElRQSIsIkFkbWluIl0sImF2YXRhciI6eyJrZXkiOiJhdmF0YXIvMTcyODU4ODE3NDU0OF9pc3RvY2twaG90by0xMzA1OTk5NzMzLTIwNDh4MjA0OC5qcGciLCJ1cmwiOiJodHRwczovL2xvY2tlcm1lZGlhLnMzLmFtYXpvbmF3cy5jb20vYXZhdGFyLzE3Mjg1ODgxNzQ1NDhfaXN0b2NrcGhvdG8tMTMwNTk5OTczMy0yMDQ4eDIwNDguanBnIn0sInBhc3N3b3JkX2NoYW5nZWQiOnRydWUsInRpbWVfem9uZSI6IihVVEMpIER1YmxpbiwgRWRpbmJ1cmdoLCBMaXNib24sIExvbmRvbiIsInN0YXR1cyI6IkFjdGl2ZSIsImRpc3BsYXlOYW1lIjoiamVlbCBhZG1pbiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc1MzU1OTA0MCwiZXhwIjoxNzU1Mjg3MDQwfQ.Yk72_n8wL8wHmQnnTLj2rwFwAG8UE3MmoThfatN5Vrg`,
      },
      body: formData,
    });

    console.log('Email API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result.success !== false; // Return true unless explicitly false
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
