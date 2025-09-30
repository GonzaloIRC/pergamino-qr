'use client';

import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}