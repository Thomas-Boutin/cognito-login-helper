const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

// fill these constants
const region = '';
const clientId = ''; // <hash>
const userPoolId = ''; // <region>_<id>
const identityPoolId = ''; // <region>:<UUID>
const cognitoIdentityLogin = ''; // cognito-idp.<region>.amazonaws.com/<userPoolId>
const cognitoUserEmail = '';
const cognitoUserPassword = '';


// main
authenticate();


// core
function authenticate() {
    var { cognitoUser, authDetails } = prepare();

    cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => obtainTemporaryCredentials(session),
        onFailure: (err) => console.log('authUser error: ' + err)
    });
}

function prepare() {
    AWS.config.region = region;
    var poolData = {
        UserPoolId: userPoolId,
        ClientId: clientId
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var authData = {
        Username: cognitoUserEmail,
        Password: cognitoUserPassword
    };

    var authDetails = new AmazonCognitoIdentity.AuthenticationDetails(authData);
    var userData = {
        Username: cognitoUserEmail,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return { cognitoUser, authDetails };
}

function obtainTemporaryCredentials(session) {
    configureIdentityCredentials(session);
    refreshCredentials();
    printCredentials();
}

function configureIdentityCredentials(session) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identityPoolId,
        Logins: {
            [cognitoIdentityLogin]: session.getIdToken().getJwtToken()
        }
    });
}

function refreshCredentials() {
    AWS.config.credentials.refresh(error => {
        if (error) {
            console.error(error);
        } else {
            console.log('Successfully logged!');
        }
    });
}

function printCredentials() {
    AWS.config.credentials.get(function () {
        var accessKeyId = AWS.config.credentials.accessKeyId;
        var secretAccessKey = AWS.config.credentials.secretAccessKey;
        var sessionToken = AWS.config.credentials.sessionToken;

        console.log('Access key :');
        console.log(accessKeyId);

        console.log('Secret access key : ');
        console.log(secretAccessKey);

        console.log('Session token : ');
        console.log(sessionToken);
    });
}
