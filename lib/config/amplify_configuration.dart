const amplifyconfig = '''{
  "UserAgent": "aws-amplify-cli/2.0",
  "Version": "1.0",
  "auth": {
    "plugins": {
      "awsCognitoAuthPlugin": {
        "IdentityManager": {"Default": {}},
        "CognitoUserPool": {
          "Default": {
            "PoolId": "us-east-1_NLhmZBt0q",
            "AppClientId": "7ggmg2h7is565730c43am4l15s",
            "Region": "us-east-1"
          }
        },
        "Auth": {
          "Default": {
            "authenticationFlowType": "USER_SRP_AUTH",
            "signupAttributes": ["email", "phone_number"],
            "usernameAttributes": [],
            "verificationMechanisms": ["email"]
          }
        }
      }
    }
  }
}''';
