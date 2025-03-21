import { createContext } from "react";

const authContext = createContext({
  authenticated: false, // to check if authenticated or not
  userId: "", // Business user id
  user: {}, // store all the user details
  accessToken: "", // accessToken of user for Auth0
  accountId: "", // accountId
  initiateLogin: () => {}, // to start the login process
  handleAuthentication: () => {}, // handle Auth0 login process,
  setUserRoles: () => {}, // Set user roles data
  logout: () => {}, // logout the user
  setApplication: () => {}, // Set application id such as (cxc, sxc, bxc, etc)
  setStoreId: () => {}, // Set store ids for the user
  storeId: "",
  application: "",
  onboarded: false, // to check if user is onboarded or not
  setOnboarded: (value) => {}, // Function to set the onboarded state
});

export const FbProvider = authContext.Provider;
export const FbConsumer = authContext.Consumer;
export const FbContext = authContext;