// src/main.jsx
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 导入 BrowserRouter
import App from './App.jsx';
import './index.css';
import 'react-photo-view/dist/react-photo-view.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 包裹 App 组件 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);