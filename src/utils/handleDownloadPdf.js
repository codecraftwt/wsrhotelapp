import { Alert } from 'react-native';
import { generatePdf } from './generatePdf';

const walstarLogoBase64 =
  'data:image/png;base64,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';

export const handleDownloadPdf = async (generateReportTable, reportTitle) => {
  try {
    // Create the HTML content dynamically
    const htmlContent = `
     <html>
  <head>
    <style>
      body {
        font-family: Arial;
        margin: 20px;
        padding-top: 30px; /* Space for logo */
      }
      h1 {
        color: #1c2f87;
        text-align: center;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th {
        background-color: #1c2f87;
        color: white;
        padding: 10px;
        text-align: left;
      }
      td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
      }
      .total-row {
        font-weight: bold;
      }
      /* Add style for logo */
      .logo {
        position: absolute;
        top: 20px;
        left: 20px;
        width: 100px; /* Adjust the size of the logo */
        height: auto;
      }
    </style>
  </head>
  <body>
    <!-- Logo image at the top left corner -->
    <img src="${walstarLogoBase64}" class="logo" alt="Logo" />
    
   <h1>${reportTitle}</h1>
    ${generateReportTable()} <!-- Extract table generation to a function -->
    <p style="margin-top: 30px; font-size: 12px; color: #666;">
      Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </p>
  </body>
</html>
    `;

    // Generate the PDF file
    const pdfPath = await generatePdf(
      htmlContent,
      `${reportTitle.replace(/[^a-z0-9]/gi, '_')}_${
        new Date().toISOString().split('T')[0]
      }.pdf`,
    );

    // Show success message with option to view
    Alert.alert('PDF Generated', 'Report has been saved successfully!', [
      { text: 'OK', style: 'default' },
      //   {
      //     text: 'View PDF',
      //     onPress: () =>
      //       FileViewer.open(pdfPath, {
      //         showOpenWithDialog: true,
      //         onDismiss: () => console.log('PDF viewer dismissed'),
      //       }),
      //   },
    ]);
  } catch (error) {
    console.error('PDF generation failed:', error);
    Alert.alert(
      'Error',
      error.message || 'Failed to generate PDF. Please try again.',
    );
  }
};
