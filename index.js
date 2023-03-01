import { registerRootComponent } from 'expo';
import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import BackgroundFetch from 'react-native-background-fetch';
import Geolocation from '@react-native-community/geolocation';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

const firebaseConfig = {
    apiKey: "AIzaSyBIxyWXOXaYCrFYjZ6NxSYFuqSPxmwwDLM",
    authDomain: "testbump-837e9.firebaseapp.com",
    projectId: "testbump-837e9",
    storageBucket: "testbump-837e9.appspot.com",
    messagingSenderId: "354846707560",
    appId: "1:354846707560:web:dfb063285f04f70462d0dd",
    measurementId: "G-WM22EQPG7C"
  };

const app = initializeApp(firebaseConfig); // initialize the Firebase app

const db = getDatabase(app); // get the Firebase database instance

var latitude = 0;
var longitude = 0;
const locationsRef = ref(db, 'locations');

const testPush = () => {
    const locationsRef = ref(db, 'locations');
    const { serverTimestamp } = getDatabase();
    push(locationsRef, { latitude: 0, longitude: 0, timestamp: serverTimestamp() })
      .then(() => console.log('Test data written successfully'))
      .catch((error) => console.log('Error writing test data:', error));
  };

const HeadlessTask1 = async () => {
    // Get user location
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(
          'User location:',
          position.coords.latitude,
          position.coords.longitude,
        );
        // Upload location to Firebase
        const {latitude, longitude} = position.coords;
        const locationsRef = ref(db, 'locations');
        push(locationsRef, {latitude, longitude});
        
        // Signal to the OS that the background task is complete
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
      },
      (error) => console.log(error),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
};

const HeadlessTask = async () => {
    console.log('Headless task started');
    const locationsRef = ref(db, 'locations');
    push(locationsRef, { latitude: 0, longitude: 0})
      .then(() => console.log('Test data written successfully'))
      .catch((error) => console.log('Error writing test data:', error));
    //BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
  };

BackgroundFetch.configure(
  {
    minimumFetchInterval: 1,
    stopOnTerminate: false,
    startOnBoot: true,
    enableHeadless: true,
    forceReload: true,
  },
  HeadlessTask,
  (error) => console.log(error),
);

/*BackgroundFetch.scheduleTask({
    taskId: 'com.foo.customtask',
    enableHeadless: true,
    delay: 1000,               // milliseconds (5s)
    forceAlarmManager: true,   // more precise timing with AlarmManager vs default JobScheduler
    periodic: false   
  });
*/

  /*async function backgroundFetchCallback(taskId) {
    console.log("[BackgroundFetch] taskId: ", taskId);
  
    switch (taskId) {
      case 'com.foo.customtask':
        console.log("Received custom task");
        break;
      default:
        console.log("Default fetch task");
    }
  
    BackgroundFetch.finish(taskId);
  }
  
  async function backgroundFetchTimeoutCallback(taskId) {
    BackgroundFetch.finish(taskId);
  }
  
  /*async function initBackgroundFetch() {
    try {
      const status = await BackgroundFetch.configure({
        minimumFetchInterval: 15
      }, backgroundFetchCallback, backgroundFetchTimeoutCallback);
  
      console.log("[BackgroundFetch] status: ", status);
  
      BackgroundFetch.scheduleTask({
        taskId: "com.foo.customtask",
        forceAlarmManager: true,
        delay: 5000
      });
  
    } catch (e) {
      console.error("[BackgroundFetch] error: ", e);
    }
  }*/
  
  //initBackgroundFetch();

registerRootComponent(App);