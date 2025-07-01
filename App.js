// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import EditorPage from './EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/doc/${uuidV4()}`} />} />
        <Route path="/doc/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
