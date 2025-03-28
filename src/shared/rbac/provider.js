import React, { useState, useEffect } from 'react';
import { FbProvider } from './context';
import { getCookie, deleteCookie, setCookie } from 'cookies-next';

const Auth = ({ children }) => {
  const initialToken = getCookie('accessToken');
  const storeId = getCookie('storeId');
  const onboardedCookie = getCookie('onboarded');

  const initialState = {
    authenticated: !!initialToken,
    accessToken: initialToken || '',
    storeId: storeId,
    onboarded: onboardedCookie === 'true',
  };

  const [state, setState] = useState(initialState);

  useEffect(() => {
    const token = getCookie('accessToken');
    const onboarded = getCookie('onboarded') === 'true';
    setState((prevState) => ({
      ...prevState,
      authenticated: !!token,
      accessToken: token || '',
      onboarded: onboarded,
    }));
  }, []);

  const initiateLogin = () => {};

  const logout = () => {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    setState({ authenticated: false, accessToken: '', storeId: '' });
  };

  const handleAuthentication = (data) => {
    setSession(data);
  };

  const setSession = (data) => {
    setState((prevState) => ({
      ...prevState,
      authenticated: true,
      accessToken: data.getIdToken().getJwtToken()
    }));
    const accessToken = data.getIdToken().getJwtToken();
    const refreshToken = data.getRefreshToken().getToken();

    // Set the access token in a cookie
    setCookie('accessToken', accessToken, {
      maxAge: 3600, // 1 hour
      path: '/',
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'Strict'
    });

    setCookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'Strict'
    });

    setCookie('authenticated', true, {
      maxAge: 1,
      path: '/',
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'Strict'
    });
  };

  const setUserRoles = (data) => {
    const user = {
      ...data
    };
    setState((prevState) => ({
      ...prevState,
      user
    }));
    user && user?.name && setCookie('name', user.name, {
      maxAge: 1,
      path: '/',
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'Strict'
    });
  };

  const setApplication = (id) => {
    setState((prevState) => ({
      ...prevState,
      application: id
    }));
  };

  const setStoreId = (id) => {
    setState((prevState) => ({
      ...prevState,
      storeId: id
    }));
    setCookie('storeId', id, {
      maxAge: 1,
      path: '/',
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'Strict'
    });
  };

  const setOnboarded = (value) => {
    setState((prevState) => ({
      ...prevState,
      onboarded: value
    }));
    setCookie('onboarded', value, {  // Store onboarded state in a cookie
      maxAge: 30*24*60*60,
      path: '/',
      secure: process.env.NODE_ENV === 'prod',
      sameSite: 'Strict'
    });
  };


  const authProviderValue = {
    ...state,
    initiateLogin: initiateLogin,
    handleAuthentication: handleAuthentication,
    setUserRoles: setUserRoles,
    setApplication: setApplication,
    setStoreId: setStoreId,
    logout: logout,
    setOnboarded: setOnboarded, // Add setOnboarded function to the context value
  };

  return <FbProvider value={authProviderValue}>{children}</FbProvider>;
};

export default Auth;