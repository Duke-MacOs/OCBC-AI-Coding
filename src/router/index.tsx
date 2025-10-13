import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageA from '../pages/PageA';
import ContractDetail from '../pages/ContractDetail';

// 当没有具体合同数据时，使用一个模块级随机 id 作为占位
const fallbackId = Math.random().toString(36).slice(2, 10);

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 首页重定向到带随机 id 的合同详情页 */}
      <Route path="/" element={<Navigate to={`/contract/${fallbackId}`} replace />} />
      
      {/* 合同详情页（带 id 参数） */}
      <Route path="/contract/:id" element={<ContractDetail />} />
      
      {/* PageA 路由保留 */}
      <Route path="/page-a" element={<PageA />} />
      
      {/* 404 重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
