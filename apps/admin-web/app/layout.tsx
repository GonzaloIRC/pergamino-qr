import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Pergamino Admin',
  description: 'Panel de administración para Pergamino',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Include Bootstrap Icons */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}