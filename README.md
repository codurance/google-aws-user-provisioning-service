# Google to AWS User & Group provisioning service
Google does not support (as of 07/2020) auto provisioning of accounts on custom SAML applications.
In order to use SSO with Google apps as the user source it must be added as a custom SAML app. The users have to be created 
inside AWS SSO with the usernames set to the login email address of
the relevant Google apps user. AWS does support auto provisioning through the use of 
its [SCIM](https://tools.ietf.org/html/rfc7644) API. 

There is no AWS SSO API for creating users, only the SCIM API is supported.

This tool uses the GSuite Admin API (specifically the directory API) to load 
the users, groups, and group memberships from google and then uploads the data 
into AWS through the SCIM API. Only groups within Google starting with "AWS" will be transferred.

# Authentication
The code requires credentials to access AWS and Google.

## Google authentication
Accessing the GSuite Admin API is slightly different to a regular Google Cloud Platform API.
A [Google Cloud Platform service account](https://developers.google.com/identity/protocols/oauth2/service-account) must first be created and then given domain wide 
delegation within the google apps admin panel to allow access to apps resources.
 
The parts with *italics* are arbitrary identifier names
 
## Detailed instructions for setting up the service account
1. Create a service user that will be used to read the users from the GSuite organisation
   1. Log In Google cloud platform with an organisation account
   1. Create new project: GoogleAppsToAWSUserSync
   1. Open project => Service accounts => Create service account
      1. Name: *AWSUserSyncLambdaFunctionAccount*
      1. Desc: Account used to read users and groups for AWS user provisioning
      1. Service account permissions: No role
      1. No user access
   1. Open new service account
      1. Enable GSuite domain wide delegation
      1. Product name for the consent screen
      1. *AWS User sync*
      1. Go back to service accounts page
      1. Under domain wide delegation for the service account click View Client ID
      1. Write down Client ID for later
      1. Create private key for service account (save for later, used for ```GOOGLE_SERVICE_ACCOUNT_BASE64_KEY_FILE```)
   1. Google cloud platform admin console => APIs & Services => Dashboard
      1. Enable APIs and Services
      1. Admin SDK
      1. Enable
1. Go to google GSuite admin panel with an account with super admin power
   1. Navigate to => Security => API Controls
   1. Click Manage Domain Wide Delegation
   1. Add new API client
   1. Paste client ID from earlier process
   1. OAuthScopes (csv): 
   ```https://www.googleapis.com/auth/admin.directory.user.readonly,https://www.googleapis.com/auth/admin.directory.group.member.readonly,https://www.googleapis.com/auth/admin.directory.group.readonly```
   1. Authorize
   1. Find google organization ID: https://play.google.com/work/adminsettings?pli=1
   1. This organization ID is required to make requests and is passed as an environment variable to the service (for ```GOOGLE_APP_ORGANISATION_ID```)
 1. Choose an email for a user that is not likely to be deleted in Google Apps for ```GOOGLE_AUTHENTICATION_SUBJECT```
### Useful links:
 - [NodeJS client for google API](https://github.com/googleapis/google-api-nodejs-client)
 - [Useful info on authenticating service accounts for apps use](https://github.com/googleapis/google-api-nodejs-client/issues/1884)

## AWS Authentication
AWS Authentication is pretty simple, it does not use IAM users as the API being used is not a standard amazon API. 
To enable the SCIM API go to AWS SSO => Settings => Automatic Provisioning => Enable.

A screen will come up providing an API endpoint and an API token to use in requests. This must be configured for the application.

# Local development
This is a typescript project designed to be compiled and run in node, this makes it easy to deploy as a lambda function.

## Environment set up
First you will need to set up the following environment variables

```
AWS_SCIM_TOKEN
AWS_SCIM_URL
GOOGLE_AUTHENTICATION_SUBJECT
GOOGLE_SERVICE_ACCOUNT_BASE64_KEY_FILE
GOOGLE_APP_ORGANISATION_ID
```

## Running
Restore packages using yarn.
```shell script
yarn install
```
To run locally you will need to compile the project using 
```
yarn run build
```
and then you can run the project using 
 ```
yarn start
```

## Deployment
You can deploy the service using terraform. The terraform files are configured to create a cloudwatch cron event that 
triggers once per day to run a sync lambda function. 

The terraform scripts have variables for credentials to be used within the lambda function.

Run the following scripts to build and deploy. The lambda package will be created in a folder called ```dist-zip```.
```shell script
yarn run build
yarn run package
cd deployment
terraform init
terraform apply
``` 

## Test
Tests are written and run using jest.

```shell script
yarn run test
```

Run jest watch using
```shell script
yarn run test-watch
```
