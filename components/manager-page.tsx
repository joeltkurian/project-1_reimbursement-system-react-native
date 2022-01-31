import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Dimensions, ScrollView, Animated, Button, Image, TextInput } from 'react-native';
import { Account, Reimbursement } from '../dtos';
import React from 'react';
import base64 from 'react-native-base64';

const image = { uri: "https://jtkbackgroundimgs.blob.core.windows.net/jtkreimbursementbackgrounds/man_Background.gif" }

export default function ManagerPage(props: { account: Account }) {

    const [reimbursements, setReimbursements] = useState([] as Reimbursement[]);
    const [currentReimb, setCurrent] = useState({ current: 0, length: 0 });
    const [update, setUpdate] = useState(false);

    async function GetAllReimbursements() {
        const accountId = props.account.id;
        const response = await fetch(`https://jtk-reimbursement-app-back-end.azurewebsites.net/reimbursement/${accountId}/true`);
        const r: Reimbursement[] = await response.json();
        //console.log(reimbursement);
        if (currentReimb.length == 0)
            setCurrent({ current: 0, length: r.length - 1 });
        setReimbursements(r);
    }

    function PrevOrNext(prev: boolean) {
        const { current, length } = currentReimb;
        if (prev) {
            console.log('pressed Prev');
            if (currentReimb.current != 0) {
                setCurrent({ current: current - 1, length: length })
            } else {
                setCurrent({ current: length, length: length })
            }
        } else {
            console.log('pressed Next');
            if (currentReimb.current != length) {
                setCurrent({ current: current + 1, length: length })
            } else {
                setCurrent({ current: 0, length: length })
            }
        }
    }

    useEffect(() => {
        GetAllReimbursements();
    }, [update]);

    return (<ImageBackground source={image} style={styles.Gif}>
        {reimbursements.length == 0 ?
            <Text style={styles.textT}>No Reimbursements present</Text>
            :
            <View style={styles.MainView}>
                <View style={styles.btns}><Button title="PREV" color="rgba(255, 255, 255, .3)" onPress={() => PrevOrNext(true)} /></View>
                <DisplayReimbursement reimbursement={reimbursements[currentReimb.current]} update={setUpdate} />
                <View style={styles.btns}><Button title="NEXT" color="rgba(255, 255, 255, .3)" onPress={() => PrevOrNext(false)} /></View>
            </View>
        }
    </ImageBackground>
    );
}

function DisplayReimbursement(props: { reimbursement: Reimbursement, update: Function }) {

    const [file, SetFile] = useState({ image: '', type: '' });
    const [showComment, setComment] = useState(false);
    const [statusComment, setStatusComment] = useState('');


    async function updateStatus(status: string) {
        let comment = null;
        let id = String(props.reimbursement.id);
        if (statusComment != '') {
            comment = statusComment;
        }
        const response = await fetch(`https://jtk-reimbursement-app-back-end.azurewebsites.net/reimbursement/${id}/${status}`,
            {
                method: 'PATCH',
                body: JSON.stringify({ statusComment: comment }),
                headers: {
                    'Content-Type': "application/json"
                }
            });
        if (response.status != 200) {
            alert(await response.text());
        } else {
            let r = await response.json();
            props.update(true);
            props.update(false);
        }
    }
    function updateFile() {
        if (props.reimbursement.formData) {
            const read = String(props.reimbursement.formData);
            const header = read.slice(0, read.indexOf(',') + 1);
            console.log(header);
            if (header.includes('image')) {
                SetFile({ image: read, type: header });
            }
            else if (header.includes('text')) {
                const text = read.slice(read.indexOf(',') + 1);
                SetFile({ image: text, type: header });
            }
            else {
                SetFile({ image: '', type: header });
            }
        }
    }
    useEffect(() => {
        updateFile();
        setComment(false);
    }, [props.reimbursement]);


    return (<View style={styles.reimbursement}>
        <View style={styles.reimbursementText}>
            <Text style={styles.textT}>Account: {props.reimbursement.account.fname} {props.reimbursement.account.lname}</Text>
            <Text style={styles.textR}>Name: {props.reimbursement.name}</Text>
            <Text style={styles.textR}>Amount: {props.reimbursement.amount}</Text>
        </View>
        {props.reimbursement.status ?
            <View>{showComment && props.reimbursement.statusComment ?
                <Text onPress={() => setComment(false)} style={styles.textR}>comment: {props.reimbursement.statusComment}</Text>
                :
                <Text onPress={() => setComment(true)} style={styles.textR}>status: {props.reimbursement.status}</Text>
            }
            </View>
            :
            <View>
                <TextInput style={styles.textR} onChangeText={t => setStatusComment(t)} />
                <View style={styles.reimbursementAppDen} >
                    <Button title="Approve" color="rgba(255, 255, 255, .3)" onPress={() => updateStatus('approved')} />
                    <Text>  </Text><Button title="Deny" color="rgba(255, 255, 255, .3)" onPress={() => updateStatus('denied')} />
                </View></View>
        }<View>
            {props.reimbursement.formData && file.image !== '' ?
                <ShowIMG file={file.image} type={file.type} /> : <Text></Text>
            }</View>
    </View>);

}

export function ShowIMG(props: { file: string, type: string }) {
    if (props.type.includes('image'))
        return (<Image style={{ width: 150, height: 150 }} source={{ uri: props.file }} />)
    else {
        const text = base64.decode(props.file);
        console.log(text);
        return (<ScrollView style={{ maxHeight: 300 }}><Text style={styles.textF}>{text}</Text></ScrollView>)
    }
}

const styles = StyleSheet.create({
    Gif: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%'
    },
    MainView: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 5,
        backgroundColor: 'rgba(255, 255, 255, .2)',
        borderRadius: 8,
        borderWidth: 1,
        maxWidth: '90%', maxHeight: '80%',
        borderColor: 'rgba(255, 255, 255, .3)',
    },
    btns: {
        marginLeft: 5,
        marginRight: 5,
        width: 30,
    },
    textT: {
        textAlign: 'center',
        fontSize: 22,
        fontFamily: 'monospace',
        padding: 4,
        color: 'white',
        opacity: 0.6
    },
    textR: {
        backgroundColor: 'rgba(255, 255, 255, .2)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, .3)',
        textAlign: 'center',
        fontSize: 20,
        fontFamily: 'monospace',
        padding: 0,
        margin: 2,
        color: 'white',
        opacity: 0.6
    },
    textF: {
        backgroundColor: 'rgba(255, 255, 255, .2)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, .3)',
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'monospace',
        padding: 0,
        margin: 2,
        color: 'white',
        opacity: 0.6
    },
    reimbursement: {
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, .2)',
        borderRadius: 8,
        borderWidth: 1,
        padding: 8,
        margin: 1,
        width: '82%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderColor: 'rgba(255, 255, 255, .3)',
    },
    reimbursementText: {
        justifyContent: 'center',
        margin: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    reimbursementAppDen: {
        margin: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

})