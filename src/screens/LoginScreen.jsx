import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

const COLORS = {
    bg: '#F8F9FE',
    primary: '#5E60CE',
    textDark: '#1E293B',
    textGray: '#64748B',
    white: '#FFFFFF',
    borderColor: '#E2E8F0',
    googleRed: '#DB4437'
};


export default function LoginScreen() {

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '327459705334-lu8c51bmeegr4iah7agslomse5bdami9.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);




    const saveUserToFirestore = async (user) => {
        try {
            const { uid, email, displayName, photoURL } = user;
            await firestore().collection('users').doc(uid).set({
                email,
                name: displayName,
                image: photoURL,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        } catch (e) {
            console.log("Firestore Save Error:", e);
        }
    };

    const onGoogleButtonPress = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            await GoogleSignin.signOut();

            const userInfo = await GoogleSignin.signIn();
            console.log("Google userInfo:", userInfo);

            const idToken = userInfo.data.idToken;

            if (!idToken) {
                throw new Error("No idToken returned from Google");
            }

            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            const userCredential = await auth().signInWithCredential(googleCredential);

            await saveUserToFirestore(userCredential.user);

            console.log("Firebase user:", userCredential.user);

        } catch (error) {
            console.log("Google Sign-In Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F8F9FE"
                translucent={false}
            />
            <View style={styles.content}>
                {/* Modern Header */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Icon name="rocket" size={40} color={COLORS.white} />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Log in to track your daily progress.</Text>
                </View>

                {/* Google Button */}
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={onGoogleButtonPress}
                    disabled={loading}
                    activeOpacity={0.7}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : (
                        <>
                            <Icon name="google" size={20} color={COLORS.googleRed} style={styles.icon} />
                            <Text style={styles.buttonText}>Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.footer}>100% Secure & Private</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textDark,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textGray,
        marginTop: 8,
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingVertical: 16,
        borderRadius: 30, // Rounded "Pill" style
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        // Modern button shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    icon: {
        marginRight: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    footer: {
        marginTop: 30,
        textAlign: 'center',
        color: COLORS.textGray,
        fontSize: 12,
        letterSpacing: 0.5,
    }
});