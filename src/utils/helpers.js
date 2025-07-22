import { PermissionsAndroid, Platform } from 'react-native';
import { logout } from '../redux/slices/authSlice';
import { store } from '../redux/store';

export const handleLogout = () => {
  store.dispatch(logout());
};

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const apiLevel = Platform.constants.Version;
      let granted;

      if (apiLevel >= 33) {
        // For Android 13+ (API level 33 and above)
        granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
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
