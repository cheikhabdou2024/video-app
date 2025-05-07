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
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const { login, state } = useAuth();

  // Validation functions
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
    return '';
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleLogin = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await login({ email, password });
      // Login successful
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error messages from API
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const apiError = error as any;
          if (apiError.response && apiError.response.data) {
            const { data } = apiError.response;
            
            if (data.error === 'Invalid email or password') {
              setErrors(prev => ({ ...prev, general: 'Invalid email or password' }));
            } else if (data.details && Array.isArray(data.details)) {
              // Handle validation errors from API
              const newErrors: any = {};
              data.details.forEach((detail: {field: string, message: string}) => {
                newErrors[detail.field] = detail.message;
              });
              setErrors(prev => ({ ...prev, ...newErrors }));
            } else {
              setErrors(prev => ({ ...prev, general: 'Login failed. Please try again.' }));
            }
          } else {
            setErrors(prev => ({ ...prev, general: 'Login failed. Please try again.' }));
          }
        } else {
          setErrors(prev => ({ ...prev, general: error.message }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: 'Login failed. Please try again.' }));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>TikTok Clone</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
        {state.error && <Text style={styles.errorText}>{state.error}</Text>}

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
            textContentType="password"
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff4757',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  registerText: {
    color: '#fff',
  },
  registerLink: {
    color: '#ff4757',
    fontWeight: 'bold',
  },
});

export default LoginScreen;