# One Doctor Web

A React frontend for the Health Monitoring System.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Access to the backend API (Flask/Firebase) running at `http://localhost:5000` or update the API URL as needed

---

## Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/sns-consultancy/one-doctor-web.git
cd one-doctor-web
```

### 2. **Set Up Environment Variables**

Create a `.env` file in the project root with the following content:

```
REACT_APP_API_KEY=defaultsecretapikey123
REACT_APP_API_URL=http://localhost:5000
```

> Update the values if your API key or backend URL are different.

### 3. **Install Dependencies**

```bash
npm install
```

### 4. **Run the Application**

```bash
npm start
```

- The app will open at [http://localhost:3000](http://localhost:3000) by default.

---

## Available Scripts

- `npm start` — Runs the app in development mode.
- `npm test` — Launches the test runner.
- `npm run build` — Builds the app for production.
- `npm run eject` — Ejects the app (not reversible).

---

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)

---

## Notes

- Make sure your backend API is running and accessible at the URL specified in your `.env`.
- For API requests, the app uses the API key from your `.env` file in the `x-api-key` header.
- Do **not** commit your `.env` file to public repositories.
