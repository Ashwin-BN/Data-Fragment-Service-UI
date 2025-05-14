# 🖥️ **Data Fragment Service UI**

A comprehensive web application for managing data fragments, integrated with AWS Cognito for authentication and designed to seamlessly interact with the Fragments microservice. This UI facilitates CRUD operations for text and JSON fragments, supporting both local and cloud-hosted API backends.

---

## 🌐 **Overview**

Fragments UI is a front-end application that enables users to:

- 🔐 Authenticate securely using AWS Cognito's OAuth2 Hosted UI.
- 📦 Create, view, update, and delete text and JSON fragments.
- 🔄 Interact with the Fragments API for seamless data storage and retrieval.
- 🌍 Switch between development (localhost) and production (AWS EC2) environments effortlessly.

---

## 🚀 **Key Features**

- **User Authentication:** Secure OAuth2-based login with AWS Cognito.
- **Multi-format Fragment Support:** Manage both text and JSON data.
- **Environment Switching:** Easily switch between local and cloud-hosted backends.
- **CRUD Operations:** Complete support for creating, reading, updating, and deleting fragments.
- **Responsive UI:** Built with Bootstrap 5 for sleek and accessible design.

---

## 🏗️ **Project Setup**

1. **Clone the repository:**
```bash
git clone https://github.com/Ashwin-BN/Data-Fragment-Service-UI.git
cd fragments-ui
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the application:**
```bash
npm start
```

4. **Build for production:**
```bash
npm run build
```

5. **Lint the project:**
```bash
npm run lint
```

---

## 🔐 **Authentication**

- The application uses **AWS Cognito Hosted UI** for OAuth2-based authentication.
- Users are securely logged in and authorized to perform CRUD operations on fragments.

---

## 📦 **Docker Deployment**

1. **Build Docker image:**
```bash
docker build -t fragments-ui .
```

2. **Run Docker container:**
```bash
docker run -p 8080:80 fragments-ui
```

3. **Nginx serves the static files for production use.**

---

## 📋 **API Endpoints Consumed**

| **Method** | **Endpoint**          | **Description**                 |
|-------------|-----------------------|---------------------------------|
| **GET**    | `/v1/fragments`       | List all user fragments         |
| **POST**   | `/v1/fragments`       | Create a new fragment           |
| **GET**    | `/v1/fragments/:id`   | Retrieve a specific fragment    |
| **PUT**    | `/v1/fragments/:id`   | Update a specific fragment      |
| **DELETE** | `/v1/fragments/:id`   | Delete a specific fragment      |

---

## 🎥 **Video Walkthrough**

[![Fragments UI Walkthrough](https://img.youtube.com/vi/tE8bJZqzIfQ/0.jpg)](https://www.youtube.com/watch?v=tE8bJZqzIfQ)

Click the image to watch the full walkthrough of the Fragments UI application.

---

## 👥 **Contributors**
- **Ashwin B N** - _Developer_

---

## 🙌 **Acknowledgements**

Special thanks to the **CCP555 Program** for guiding the development of this project.
