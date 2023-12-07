import { useState, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import * as config from '../config';

const userPool = new CognitoUserPool({
  UserPoolId: config.UserPoolId,
  ClientId: config.ClientId,
});

export const useCognitoToken = () => {
  let idToken = '';
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.getSession((err, session) => {
      if (err) {
        console.error(err);
        return;
      }
      idToken = session.getIdToken().getJwtToken();
    });
  }

  return idToken;
};
