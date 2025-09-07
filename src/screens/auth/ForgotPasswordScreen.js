import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = React.useState('');
  const { resetPassword } = useAuth();
  const [resetSent, setResetSent] = React.useState(false);

  const handleResetPassword = async () => {
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      console.error('Error sending reset email:', error);
      // Handle error with proper UI feedback
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pergamino</Text>
      <Text style={styles.subtitle}>Reset Password</Text>
      
      {resetSent ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Password reset link sent to your email.
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.instructions}>
            Enter your email address below and we'll send you instructions to reset your password.
          </Text>
          
          <Text style={styles.inputLabel}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#6200ee',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginLeft: 3,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6200ee',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6200ee',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
    marginBottom: 20,
  },
});
