# Airbank payments API

This is a simple Node.js application that demonstrates how to use the Airbank payments API. It sends a payment order from one account to another and notifies you via email if anything goes wrong.

## Prerequisites

Before running the application, you need to have the following:

- A valid Airbank API client ID and secret
- A valid Airbank access token

## Configuration

To configure the application, you need to create a `.env` file in the root directory of the project and add the following variables:

```
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token
EMAIL_FROM=your_email_address
EMAIL_PASSWORD=your_email_password
```

Replace `your_client_id`, `your_client_secret`, `your_refresh_token`, `your_email_address`, and `your_email_password` with your actual values.

To generate a new access token, you can use the `printAccess.ts` file in the `accessToken` directory. This file contains a function that prints the access token to the console. To run the script, use the following command:

```
pnpm accessToken
```
