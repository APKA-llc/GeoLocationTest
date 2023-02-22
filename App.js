import React, { useState, useEffect } from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { BackgroundFetch, BackgroundTask } from 'react-native-background-actions';

//import {auth, user} from "./firebaseConfig";

const USER_ID = '1';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

import { Platform, PermissionsAndroid } from 'react-native';

async function requestPermissions() {
  if (Platform.OS === "ios") {
    const auth = await Geolocation.requestAuthorization("always");
    if (auth === "granted") {
      // do something if granted...
    }
  }

  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // do something if granted...
    }
  }
}

BackgroundTask.define(async () => {
  console.log('Running background task...');
  await handleSendLocation();
  BackgroundTask.finish();
});

const options = {
  taskName: 'Update Location',
  taskTitle: 'Updating Location...',
  taskDesc: 'Updating your location in Firebase Realtime Database',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  parameters: {
    location: null,
  },
};

const registerTask = async () => {
  await BackgroundTask.register({
    taskFunction,
    options,
  });
};

const startTask = async () => {
  const hasRegistered = await BackgroundTask.isTaskRegistered({
    taskName: options.taskName,
  });

  if (hasRegistered) {
    await BackgroundTask.start({
      taskName: options.taskName,
      taskTitle: options.taskTitle,
      taskDesc: options.taskDesc,
      parameters: {
        location,
      },
    });
  }
};



const App = () => {
  const [position, setPosition] = useState({
    latitude: null,
    longitude: null,
    altitude: null,
    distance: null,
  });

  const targetLocation = {
    latitude: 37.785834,
    longitude: -122.406417,
  };

  useEffect(() => {
    registerTask();
    startTask();

    BackgroundTask.schedule({
      taskName: 'Send Location',
      taskTitle: 'Updating Location...',
      taskDesc: 'This task updates the user location every 10 seconds',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ffffff',
      parameters: {
        userID: USER_ID,
        latitude: position.latitude,
        longitude: position.longitude,
      },
      period: 10000, // 10 seconds
      actions: '["Stop"]',
    });

    Geolocation.watchPosition(
      position => {
        const { latitude, longitude, altitude } = position.coords;
        const distance = calculateDistance(
          latitude,
          longitude,
          targetLocation.latitude,
          targetLocation.longitude
        );
        setPosition({ latitude, longitude, altitude, distance });
      },
      error => console.log(error),
      { enableHighAccuracy: true, distanceFilter: 50 }
    );

    return () => {
      Geolocation.clearWatch();
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleSendLocation = async () => {
    try {
      const updateLocation = firebase.functions().httpsCallable('updateLocation');
      const response = await updateLocation({
        userID: USER_ID, // Replace with the user's ID
        latitude: position.latitude,
        longitude: position.longitude,
      });
      console.log(response.data); // Log the response from the Cloud Function
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleGetLocation = async () => {
    await requestPermissions
  }
  
  return (
    <View style={styles.container}>
      <Text>Welcome!</Text>
      <View
        style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
        <Button title="Get Location" onPress={handleGetLocation}/>
      </View>
      <Text>Latitude: {position.latitude}</Text>
      <Text>Longitude: {position.longitude}</Text>
      <Text>Altitude: {position.altitude}</Text>
      <View
        style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
        <Button title="Send Location" onPress={handleSendLocation}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#fff',
   alignItems: 'center',
   justifyContent: 'center',
 },
});

export default App;