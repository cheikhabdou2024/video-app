import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const { register, state } = useAuth();

  // Validation functions
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return 'Username is required';
    }
    if (value.length < 3 || value.length > 30) {
      return 'Username must be between 3 and 30 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Email is required';
    }
    // Email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return 'Please confirm your password';
    }
    if (value !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };

    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleRegister = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await register({ username, email, password });
      // Registration successful
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error messages from API
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const apiError = error as any;
          if (apiError.response && apiError.response.data) {
            const { data } = apiError.response;
            
            if (data.error === 'Email already in use') {
              setErrors(prev => ({ ...prev, email: 'Email is already in use' }));
            } else if (data.error === 'Username already taken') {
              setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
            } else if (data.details && Array.isArray(data.details)) {
              // Handle validation errors from API
              const newErrors: any = {};
              data.details.forEach((detail: {field: string, message: string}) => {
                newErrors[detail.field] = detail.message;
              });
              setErrors(prev => ({ ...prev, ...newErrors }));
            } else {
              setErrors(prev => ({ ...prev, general: 'Registration failed. Please try again.' }));
            }
          } else {
            setErrors(prev => ({ ...prev, general: 'Registration failed. Please try again.' }));
          }
        } else {
          setErrors(prev => ({ ...prev, general: error.message }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: 'Registration failed. Please try again.' }));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the TikTok Clone community</Text>

          {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
          {state.error && <Text style={styles.errorText}>{state.error}</Text>}

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.username ? styles.inputError : null]}
              placeholder="Username"
              placeholderTextColor="#888"
              value={username}
              onChangeText={text => {
                setUsername(text);
                if (errors.username) {
                  setErrors(prev => ({ ...prev, username: undefined }));
                }
              }}
              autoCapitalize="none"
            />
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              secureTextEntry
              textContentType="newPassword"
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              secureTextEntry
              textContentType="newPassword"
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff4757',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  errorText: {
    color: '#ff4757',
    marginTop: 4,
    fontSize: 12,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff4757',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  loginText: {
    color: '#fff',
  },
  loginLink: {
    color: '#ff4757',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;