'use client';

import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function ClientsLayout({
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