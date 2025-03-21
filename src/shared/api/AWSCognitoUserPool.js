import { CognitoUserPool } from "amazon-cognito-identity-js";
const awsconfig = {
  //   Auth: {
  region: "us-east-1",
  UserPoolId: "us-east-1_tE36FUCEy",
  ClientId: "7g080on7ebd8lmiuu0u2nmigtv",
  cookieStorage: {
    domain: ".yourdomain.com",
    path: "/",
    expires: 365,
    sameSite: "strict" | "lax",
    secure: true,
  },
  oauth: {
    domain: "https://videoassistant.auth.us-east-1.amazoncognito.com",
    scope: ["email", "profile"],
    redirectSignIn: "http://localhost:3000/",
    redirectSignOut: "http://localhost:3000/",
    responseType: "code", // or 'token'
  },
};

export default new CognitoUserPool(awsconfig);
