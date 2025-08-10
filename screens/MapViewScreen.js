// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, Modal } from 'react-native';
// import MapView, { Marker, Callout } from 'react-native-maps';
// import * as Location from 'expo-location';
// import API from '../services/api';
// import { Picker } from '@react-native-picker/picker';

// export default function MapViewScreen() {
//   const [location, setLocation] = useState(null);
//   const [transactions, setTransactions] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [filteredTxns, setFilteredTxns] = useState([]);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         alert('Permission denied');
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       setLocation(loc.coords);

//       const res = await API.get('/transactions/user');
//       setTransactions(res.data.transactions.filter(txn => txn.location?.lat && txn.location?.lng));
//     })();
//   }, []);

//   useEffect(() => {
//     if (!selectedCategory) {
//       setFilteredTxns(transactions);
//     } else {
//       setFilteredTxns(transactions.filter(txn => txn.category === selectedCategory));
//     }
//   }, [selectedCategory, transactions]);

//   if (!location) return <Text>Loading map...</Text>;
//   console.log(filteredTxns)

//   return (
//     <View style={styles.container}>
//       <Picker
//         selectedValue={selectedCategory}
//         onValueChange={(val) => setSelectedCategory(val)}
//         style={styles.picker}
//       >
//         <Picker.Item label="All Categories" value="" />
//         <Picker.Item label="Food" value="food" />
//         <Picker.Item label="Transport" value="transport" />
//         <Picker.Item label="Groceries" value="groceries" />
//         {/* Add more dynamically if you have */}
//       </Picker>

//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: location.latitude,
//           longitude: location.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         {/* {filteredTxns.map((txn) => (
//           <Marker
//             key={txn._id}
//             coordinate={{
//               latitude: txn.location.lat,
//               longitude: txn.location.lng,
//             }}
//             // title={txn.merchant || 'Unknown'}
//             // description={`₹${txn.amount} • ${txn.category}`}
//           >
//             <Callout>
//              <View style={styles.calloutContainer}>
//             <Text style={styles.merchant}>{txn.merchant}</Text>
//             <Text style={styles.amount}>₹{txn.amount}</Text>
//             <Text style={styles.category}>{txn.category}</Text>
//             </View>
//             </Callout>
//           </Marker>
//         ))} */}
//         <Marker coordinate={{ latitude: 28.6139, longitude: 77.2090 }}>
//   <Callout>
//     <View style={styles.calloutContainer}>
//       <Text style={{ fontWeight: 'bold' }}>Static Test</Text>
//       <Text>₹100 • Food</Text>
//     </View>
//   </Callout>
// </Marker>
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { 
//     flex: 1,
//     width: '100%',
//     height: '100%' 
//   },
//   picker: {
//     position: 'absolute',
//     top: 10,
//     left: 10,
//     right: 10,
//     backgroundColor: '#fff',
//     zIndex: 999,
//   },
//   calloutContainer: {
//   backgroundColor: 'white',
//   padding: 10,
//   borderRadius: 8,
//   minWidth: 160,
//   elevation: 5, // for Android
//   shadowColor: '#000', // for iOS
//   shadowOffset: { width: 0, height: 2 },
//   shadowOpacity: 0.3,
//   shadowRadius: 4,
// },

// merchant: {
//   fontWeight: 'bold',
//   fontSize: 16,
//   marginBottom: 4,
// },
// amount: {
//   fontSize: 14,
//   color: 'green',
//   marginBottom: 2,
// },
// category: {
//   fontSize: 12,
//   color: '#555',
// }

// });

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

export default function MapScreen() {
  return (
    <MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  <Marker coordinate={{ latitude: 28.6139, longitude: 77.2090 }}>
    <Callout>
      <View style={{
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        minWidth: 150
      }}>
        <Text style={{ fontWeight: 'bold' }}>Domino’s Pizza</Text>
        <Text>Food • Jun 5, 7:15 PM</Text>
        <Text>₹450</Text>
      </View>
    </Callout>
  </Marker>
</MapView>

  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    minWidth: 160,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
});
