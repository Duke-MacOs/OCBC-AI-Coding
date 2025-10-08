import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageA from '../pages/PageA';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 默认重定向到 PageA */}
      <Route path="/" element={<Navigate to="/page-a" replace />} />
      
      {/* PageA 路由 */}
      <Route path="/page-a" element={<PageA />} />
      
      {/* 404 页面 */}
      <Route path="*" element={<Navigate to="/page-a" replace />} />
    </Routes>
  );
};

export default AppRouter;
