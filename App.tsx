import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Button } from 'react-native';
import LoginPage from './components/login-page';
import ManagerPage from './components/manager-page';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Account } from './dtos';

export default function App() {

  const [user, setUser] = useState<Account>({ fname: '', lname: '', username: 'NOT LOGGED', password: "", isManager: "", id: '' });
  useEffect(() => {
    AsyncStorage.getItem('user').then(json => {
      if (json) {
        setUser(JSON.parse(json))
      }
    });
  }, []);

  return (

    <View style={styles.container}>
      {user.username === 'NOT LOGGED' ?
        <LoginPage setUser={setUser} /> : <ManagerPage account={user} />
      }
      {user.username != 'NOT LOGGED' ?
        <View style={styles.logout}><Button title="Log Out" color="rgba(255, 255, 255, .3)" onPress={async () => {
          const account = { fname: '', lname: '', username: 'NOT LOGGED', password: "", isManager: "", id: '' };
          await AsyncStorage.setItem("user", JSON.stringify(account));
          setUser(account);
        }} /></View> : <View></View>
      }
    </View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logout: {
    position: 'absolute',
    right: 5,
    top: 30,
    backgroundColor: 'rgba(255, 255, 255, .2)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 0,
    borderColor: 'rgba(255, 255, 255, .3)',
  }
});
