import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, PermissionsAndroid } from 'react-native';
import { requestPermissions } from './helpers';

const isRNHTMLtoPDFAvailable =
  RNHTMLtoPDF && typeof RNHTMLtoPDF.convert === 'function';
export const generatePdf = async (htmlContent, fileName) => {
  try {
    // Check if RNHTMLtoPDF is available before using it
    if (!isRNHTMLtoPDFAvailable) {
      throw new Error('RNHTMLtoPDF is not available');
    }

    await requestPermissions();
    // Configure PDF options
    const options = {
      html: htmlContent,
      fileName: fileName.replace(/[^a-z0-9]/gi, '_'), // Sanitize filename
      directory: Platform.OS === 'android' ? 'Downloads' : 'Documents',
      base64: false,
      padding: 12,
      bgColor: '#FFFFFF',
    };

    // Generate PDF
    const { filePath } = await RNHTMLtoPDF.convert(options);

    if (!filePath) {
      throw new Error('Failed to generate PDF file');
    }

    console.log('PDF generated at:', filePath);
    return filePath;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};
