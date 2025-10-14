import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, PermissionsAndroid } from 'react-native';
import { requestPermissions, requestPermissionsGracefully } from './helpers';

const isRNHTMLtoPDFAvailable =
  RNHTMLtoPDF && typeof RNHTMLtoPDF.convert === 'function';
export const generatePdf = async (htmlContent, fileName) => {
  try {
    // Check if RNHTMLtoPDF is available before using it
    if (!isRNHTMLtoPDFAvailable) {
      throw new Error('RNHTMLtoPDF is not available');
    }

    // Try to request permissions gracefully
    const hasPermissions = await requestPermissionsGracefully();
    if (!hasPermissions) {
      console.warn('Permissions not granted, using app-scoped storage');
      // Continue with PDF generation using app-scoped storage
    }
    // Configure PDF options
    const options = {
      html: htmlContent,
      fileName: fileName.replace(/[^a-z0-9]/gi, '_'), // Sanitize filename
      directory: hasPermissions 
        ? (Platform.OS === 'android' ? 'Download' : 'Documents') 
        : 'Documents', // Use app-scoped Documents if no permissions
      base64: false,
      padding: 12,
      bgColor: '#FFFFFF',
      width: 595, // A4 width in points
      height: 842, // A4 height in points
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