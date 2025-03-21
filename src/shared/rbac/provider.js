import React, { useState, useEffect } from 'react';
import { FbProvider } from './context';
import {  getCookie, deleteCookie, setCookie } from 'cookies-next';

const Auth = ({ children }) => {
  const initialToken = getCookie('accessToken');
  const storeId = getCookie('storeId');

  const initialState = {
    authenticated: !!initialToken, //token && token !== 'undefined' ? true : false, //&& (userId && userId !== "undefined")
    accessToken: initialToken || '',
    storeId: storeId
  };

  const [state, setState] = useState(initialState);

  useEffect(() => {
    // Update state based on cookies when the component mounts
    const token = getCookie('accessToken');
    // Update the document title using the browser API
    setState((prevState) => ({
      ...prevState,
      authenticated: !!token,
      accessToken: token || ''
      // storeId: storeId || ''
    }));
  }, []);

  const initiateLogin = () => {};

  const logout = () => {
    deleteCookie('accessToken', '', 0);
    deleteCookie('refreshToken', '', 0);
    deleteCookie('authenticated', false, 0);
    deleteCookie('userId', '', 0);
    deleteCookie('storeId', '', 0);
    deleteCookie('accountId', '', 0);
    deleteCookie('name', '', 0);
    setState({ authenticated: false, accessToken: '', storeId: '' });
  };

  const handleAuthentication = (data) => {
    setSession(data);
  };

  const setSession = (data) => {
    setState((state) => ({
      ...state,
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

    setCookie('authenticated', true, 1);
  };

  const setUserRoles = (data) => {
    const user = {
      ...data
    };
    setState((state) => ({
      ...state,
      user
    }));
    user && user?.name && setCookie('name', user.name, 1);
  };

  const setApplication = (id) => {
    setState((state) => ({
      ...state,
      application: id
    }));
  };

  const setStoreId = (id) => {
    setState((state) => ({
      ...state,
      storeId: id
    }));
    setCookie('storeId', id, 1);
  };

  const authProviderValue = {
    ...state,
    initiateLogin: initiateLogin,
    handleAuthentication: handleAuthentication,
    setUserRoles: setUserRoles,
    setApplication: setApplication,
    setStoreId: setStoreId,
    logout: logout
  };
  return <FbProvider value={authProviderValue}>{children}</FbProvider>;
};

export default Auth;
