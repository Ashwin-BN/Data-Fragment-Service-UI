# Fragments UI

## Overview
**Fragments UI** is a front-end web application designed for testing the **Fragments API**. It provides a simple interface to interact with the back-end service, enabling users to create and manage text fragments. The UI integrates with **AWS Cognito** for authentication and supports multiple API environments, including development (localhost) and production (AWS EC2).

## Features
- **User Authentication**: Utilizes AWS Cognito OAuth2 for secure user authentication and authorization.
- **Dynamic API Configuration**: Supports switching between different back-end API servers (e.g., localhost for development, AWS EC2 for production).
- **Fragment Management**: Allows users to create simple text fragments and store them on the Fragments API server.
- **Bundler Setup**: Uses Parcel for efficient module bundling and front-end optimization.
- **Development Tools**: Includes ESLint and Prettier for code quality enforcement.

## Prerequisites
Ensure the following dependencies are installed before running the application:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- Running instance if th Fragments API

## Installation
Clone the repository and install dependencies:
```sh
git clone https://github.com/Ashwin-BN/fragments-ui.git
cd fragments-ui
npm install
```

Create a `.env` file in the project root with the following variables:
```sh
# Fragments microservice API URL
API_URL=<YOUR_API_URL>
   
# AWS Cognito Configuration
AWS_COGNITO_POOL_ID=<YOUR_COGNITO_POOL_ID>
AWS_COGNITO_CLIENT_ID=<YOUR_COGNITO_CLIENT_ID>
   
# OAuth Redirect URLs (Ensure consistency with Cognito settings)
OAUTH_SIGN_IN_REDIRECT_URL=<YOUR_SIGN_IN_REDIRECT_URL>
OAUTH_SIGN_OUT_REDIRECT_URL=<YOUR_SIGN_OUT_REDIRECT_URL>
```

## Usage

- Start the development server:
  ```sh
  npm start
  ```
- Build the project:
  ```sh
  npm run build
  ```
- Lint the code:
  ```sh
  npm run lint
  ```
## Development & Testing
To start the development server:
```sh
npm start
```
This will launch the UI at `http://localhost:1234/`.

To lint JavaScript files:
```sh
npm run lint
```

To build the application for production:
```sh
npm run build
```

## Configuration
The application can be configured to work with different API servers. Modify the configuration to switch between:
- **Local Development**: `http://localhost:8080`
- **AWS EC2 Deployment**: `http://ec2-54-197-161-231.compute-1.amazonaws.com:8080/`

## Authentication
The UI integrates with **AWS Cognito Hosted UI** for authentication. Ensure that the Cognito setup is configured correctly to allow user login and token-based authorization.

## Completed Checklist for Front-End Web Testing
- [x] **Development environment** configured (`npm`, `eslint`, `prettier`, scripts, etc.)
- [x] **Bundler configured** (Parcel)
- [x] **Basic web app functionality** for manually testing API server
- [x] **AWS Cognito authentication** integrated
- [x] **Dynamic API configuration** (localhost vs. EC2 instance)
- [x] **Fragment creation and storage** functionality implemented
- [x] **UI successfully communicating with EC2-hosted API**

## Future Improvements
- Enhance **UI elements** to display complete fragment details (currently only shows IDs).
- Improve **API request handling** for better performance and reliability.
- Implement **persistent storage** for fragments beyond the session lifecycle.
