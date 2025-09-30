'use client';

import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function BenefitsLayout({
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