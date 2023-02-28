import React, { useState, useEffect } from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';

async function requestPermissions() {
  if (Platform.OS === 'ios') {
    const auth = await Geolocation.requestAuthorization("whenInUse");
    if(auth === "granted") {
      // do something if granted...
    }
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // do something if granted...
    }
  }
}


const App = () => {
  const [position, setPosition] = useState({
    latitude: null,
    longitude: null,
    altitude: null,
    distance: null,
  });

  const targetLocation = {
    latitude: 32.739061,
    longitude: -96.824530,
  };

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (location) => {
        const { latitude, longitude, altitude } = location.coords;
        const distance = calculateDistance(
          latitude,
          longitude,
          targetLocation.latitude,
          targetLocation.longitude
        );
        setPosition({ latitude, longitude, altitude, distance });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
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

  const handleGetLocation = async () => {
    await requestPermissions();
  };
  
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
      <Text>Distance from Target Location: {position.distance}</Text>
      <View
        style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
        <Button title="Send Location" />
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