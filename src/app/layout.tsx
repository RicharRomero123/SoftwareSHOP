// src/app/layout.tsx
import type { Metadata } from 'next/types';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

// ✅ SOLUCIÓN: Metadatos optimizados para SEO
export const metadata: Metadata = {
  // Título principal: Atractivo y con palabras clave
  title: {
    template: '%s | SistemasVIP.shop',
    default: 'SistemasVIP.shop | Cuentas Streaming y Herramientas Digitales',
  },
  // Descripción: Vendedora y con palabras clave
  description: 'Compra cuentas de Netflix, Disney+, Spotify y herramientas como Canva a precios bajos en SistemasVIP.shop. Acceso instantáneo y seguro. ¡Tu entretenimiento y productividad al mejor costo!',
  // Palabras clave para que te encuentren
  keywords: [
    'cuentas de streaming', 
    'comprar netflix', 
    'disney plus barato', 
    'spotify premium', 
    'canva pro', 
    'sistemasvip', 
    'cuentas streaming perú', 
    'entrega inmediata streaming',
    'cuentas baratas',
    'plataformas de streaming'
  ],
  // Metadatos para compartir en redes sociales (Facebook, WhatsApp, etc.)
  openGraph: {
    title: 'SistemasVIP.shop | Cuentas de Streaming y Herramientas Digitales',
    description: 'Acceso instantáneo a Netflix, Disney+, Canva Pro y más a precios increíbles.',
    url: 'https://sistemasvip.shop',
    siteName: 'SistemasVIP.shop',
    images: [
      {
        url: 'https://res.cloudinary.com/dod56svuf/image/upload/v1751876631/Logotipo_reposter%C3%ADa_y_macarrones_marr%C3%B3n_qa2wd1.png', // Recomiendo crear una imagen promocional de 1200x630px
        width: 1200,
        height: 630,
        alt: 'Promoción de Cuentas de Streaming en SistemasVIP.shop',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
  // Metadatos para compartir en Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'SistemasVIP.shop | Cuentas de Streaming y Herramientas Digitales',
    description: 'Acceso instantáneo a Netflix, Disney+, Canva Pro y más a precios increíbles.',
    images: ['https://res.cloudinary.com/dod56svuf/image/upload/v1751870405/WhatsApp_Image_2025-07-06_at_6.34.11_PM_jejyh9.jpg'], // La misma imagen que Open Graph
  },
  // Instrucciones para los robots de búsqueda
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // URL canónica para evitar contenido duplicado
  alternates: {
    canonical: 'https://sistemasvip.shop',
  },
  // Información del autor/marca
  authors: [{ name: 'SistemasVIP.shop', url: 'https://sistemasvip.shop' }],
  creator: 'SistemasVIP.shop',
};


export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
    <body className={inter.className}>
    <AuthProvider>
      {children}
    </AuthProvider>
    </body>
    </html>
  );
}