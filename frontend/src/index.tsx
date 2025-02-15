import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

console.log('index.tsx loaded');
const root = ReactDOM.createRoot(document.getElementById('content')!);
root.render(<App />);
