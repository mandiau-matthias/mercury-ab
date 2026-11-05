import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import {App} from './App.jsx';
hydrateRoot(document.getElementById('root'),<React.StrictMode><App {...JSON.parse(document.getElementById('bootstrap').textContent)}/></React.StrictMode>);
