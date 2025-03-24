import { CognitoUserPool } from "amazon-cognito-identity-js";
const awsconfig = {
  region: "us-east-1",
  UserPoolId: "us-east-1_ewbCWJClc",
  ClientId: "7q535i5hgdbrmfs08tmqkqah9d",
  cookieStorage: {
    domain: ".yourdomain.com",
    path: "/",
    expires: 365,
    sameSite: "strict" | "lax",
    secure: true,
  },
  oauth: {
    domain: "https://us-east-1ewbcwjclc.auth.us-east-1.amazoncognito.com/",
    scope: ["email", "profile"],
    redirectSignIn: "http://localhost:3000/",
    redirectSignOut: "http://localhost:3000/",
    responseType: "code", // or 'token'
  },
};

export default new CognitoUserPool(awsconfig);


// UserPoolId: "us-east-1_ewbCWJClc",
// ClientId: "7q535i5hgdbrmfs08tmqkqah9d", 
// domain: "https://us-east-1ewbcwjclc.auth.us-east-1.amazoncognito.com",