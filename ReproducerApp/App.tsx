/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';

async function hasAndroidPermission() {
  const getCheckPermissionPromise = () => {
    if (Number(Platform.Version) >= 33) {
      return Promise.all([
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
      ]).then(
        ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
          hasReadMediaImagesPermission && hasReadMediaVideoPermission,
      );
    } else {
      return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }
  };

  const hasPermission = await getCheckPermissionPromise();
  if (hasPermission) {
    return true;
  }
  const getRequestPermissionPromise = () => {
    if (Number(Platform.Version) >= 33) {
      return PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]).then(
        (statuses) =>
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED,
      );
    } else {
      return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((status) => status === PermissionsAndroid.RESULTS.GRANTED);
    }
  };

  return await getRequestPermissionPromise();
}

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [loading, setLoading] = useState(false);
  const onButton1 = useCallback( async ()=>{
    setLoading(true);
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      Alert.alert('Don\'t have permissions');
      return;
    }
    try{
    const { edges } = await CameraRoll.getPhotos({ first: 1 ,assetType: 'Videos' });
    var uri = edges[0].node.image.uri;
    if (Platform.OS === 'ios' && uri.startsWith('ph:')){
      uri = (await CameraRoll.iosGetImageDataById(uri)).node.image.filepath ?? uri;
    }
    const response = await fetch(uri);
    const blob = await response.blob();
    Alert.alert('Succesfully loaded a file with length' + Math.round(blob.size / (1024 * 1024)) + 'MB');
    }catch(e){
      Alert.alert('Failed to load file' + e);
    }
    setLoading(false);
  },[]);



  //Based on the BlobModule testing code on https://github.com/expo/react-native-blob-test/blob/master/index.common.js
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            You need a large video file, to test the blob + large file fetch.
          </Section>
          <View style={styles.spacer} />
          <Button onPress={onButton1} title={loading ?  'Loading.. please wait.' : 'Choose a Large file'} disabled={loading} />
          <View style={styles.spacer} >
            <Text style ={styles.smallfont}> Error was reproduced with a 442 MB .mp4 file (55seconds of 3840 × 2160 px Ultra HD video.) </Text>
            <Text style={styles.highlight}> Use logcat to capture & view the underlying android error.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  spacer: {paddingTop: 5},
  smallfont: {fontSize:12, padding: 10},
});

export default App;
