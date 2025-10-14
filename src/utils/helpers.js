import { PermissionsAndroid, Platform } from 'react-native';
import { logout } from '../redux/slices/authSlice';
import { store } from '../redux/store';

export const handleLogout = () => {
  store.dispatch(logout());
};

// Alternative permission request that's more lenient
export const requestPermissionsGracefully = async () => {
  if (Platform.OS === 'android') {
    try {
      const apiLevel = Platform.constants.Version;
      
      if (apiLevel >= 33) {
        // For Android 13+, try legacy permissions first (more likely to be granted)
        const legacyPermissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];
        
        const legacyGranted = await PermissionsAndroid.requestMultiple(legacyPermissions);
        
        // If legacy permissions work, we're good
        if (
          legacyGranted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          legacyGranted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Legacy permissions granted successfully');
          return true;
        }
      }
      
      // Fallback: try just basic storage permission
      const basicGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'We need access to your storage to save PDFs.',
          buttonPositive: 'OK',
        },
      );
      
      return basicGranted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Graceful permission request failed:', error);
      return false; // Don't throw, just return false
    }
  }
  return true; // iOS doesn't need these permissions
};

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const apiLevel = Platform.constants.Version;
      let granted;

      if (apiLevel >= 34) {
        // Android 14 and above (including Android 15)
        try {
          // First try the new media permissions
          const mediaPermissions = [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_DOCUMENTS,
          ];
          
          granted = await PermissionsAndroid.requestMultiple(mediaPermissions);
          
          // Check if we got the essential permissions
          const hasDocumentPermission = granted['android.permission.READ_MEDIA_DOCUMENTS'] === PermissionsAndroid.RESULTS.GRANTED;
          const hasImagePermission = granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED;
          
          // If document permission is denied, try legacy permissions as fallback
          if (!hasDocumentPermission) {
            console.warn('READ_MEDIA_DOCUMENTS denied, trying legacy permissions...');
            
            const legacyPermissions = [
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ];
            
            const legacyGranted = await PermissionsAndroid.requestMultiple(legacyPermissions);
            
            if (
              legacyGranted['android.permission.READ_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED ||
              legacyGranted['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
            ) {
              throw new Error('Both new and legacy storage permissions denied');
            }
            
            // Merge the results
            granted = { ...granted, ...legacyGranted };
          }
        } catch (error) {
          console.error('Permission request error:', error);
          throw new Error('Permission request failed');
        }
      } else if (apiLevel >= 33) {
        // For Android 13+ (API level 33 and above)
        granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.READ_MEDIA_IMAGES'] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_MEDIA_VIDEO'] !==
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          throw new Error('Media permissions denied');
        }
      } else if (apiLevel >= 29) {
        // For Android 10+ (API level 29 and above)
        granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.READ_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          throw new Error('Storage permission denied');
        }
      } else {
        // For older versions (below API level 29)
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'We need access to your storage to save PDFs.',
            buttonPositive: 'OK',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Storage permission denied');
        }
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      throw new Error('Permission request failed');
    }
  }
};
