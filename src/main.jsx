// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// // THE FIX IS HERE:
// // This line imports the main CSS file, which is essential for Tailwind to work.
// import './index.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );

import React from "react";
import ReactDOM from 'react-dom/client'
import App from './App';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)