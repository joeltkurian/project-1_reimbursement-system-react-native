import { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, TextInput, Button } from 'react-native';
import { Account } from '../dtos';
import AsyncStorage from '@react-native-async-storage/async-storage';
const image = { uri: "https://jtkbackgroundimgs.blob.core.windows.net/jtkreimbursementbackgrounds/emp_Background.gif" };
export default function LoginPage(props: { setUser: Function }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState("");

    async function login() {
        const loginPayload = {
            username: username,
            password: password
        }
        const response = await fetch('https://jtk-reimbursement-app-back-end.azurewebsites.net/login', {
            method: 'PATCH',
            body: JSON.stringify(loginPayload),
            headers: {
                'Content-Type': "application/json"
            }
        })
        if (response.status === 410) {
            const err = await response.text();
            alert(err);
        }
        else if (response.status === 411) {
            const err = await response.text();
            alert(err);
        }

        else {
            const account: Account = await response.json();
            if (account.isManager == 'true') {
                await AsyncStorage.setItem("user", JSON.stringify(account));
                props.setUser(account);
            } else {
                alert('This App is for Manager\'s only!')
            }
        }
    }

    return (
        <ImageBackground source={image} style={styles.Gif}>
            <View style={styles.loginContainer}>
                <View style={styles.content}>
                    <Text style={styles.text}>username:</Text>
                    <TextInput style={styles.textInput} onChangeText={t => setUsername(t)} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.text}>password:</Text>
                    <TextInput style={styles.textInput} onChangeText={t => setPassword(t)} />
                </View>
                <Button title="Submit" color="rgba(255, 255, 255, .3)" onPress={login} />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    loginContainer: {
        backgroundColor: 'rgba(255, 255, 255, .2)',
        borderRadius: 8,
        borderWidth: 1,
        padding: 8,
        borderColor: 'rgba(255, 255, 255, .3)',
    },
    content: {
        flexDirection: 'row',
        textAlign: 'center',
        padding: 6,
    },
    text: {
        textAlign: 'center',
        fontSize: 20,
        fontFamily: 'monospace',
        padding: 4,
        color: 'white',
    },
    textInput: {
        backgroundColor: 'rgba(255, 255, 255, .2)',
        borderRadius: 8,
        fontSize: 20,
        fontFamily: 'monospace',
        minWidth: 200,
        borderWidth: 1,
        padding: 4,
        borderColor: 'rgba(255, 255, 255, .3)',
        color: 'white',
    },
    Gif: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%'
    }
});