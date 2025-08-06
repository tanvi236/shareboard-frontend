import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { LoginData } from '../../types';
import { Button, Input, FormGroup, Label, ErrorText, LoadingSpinner } from '../../styles/GlobalStyles';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    try {
      setLoading(true);
      await login(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('email', { message: 'Invalid email or password' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormGroup>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />
        {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
      </FormGroup>

      <Button type="submit" disabled={loading}>
        {loading && <LoadingSpinner />}
        Login
      </Button>
    </Form>
  );
};

export default LoginForm;
