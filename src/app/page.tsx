// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react'; // ✅ SOLUCIÓN: Se añadió useEffect a la importación
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, ChevronLeft, Zap, ShieldCheck, Download, Monitor, Users } from 'lucide-react';

// --- Componente de Navegación ---
const Navbar = () => (
  <header className="absolute top-0 left-0 w-full z-30 p-4 sm:p-6">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <Image src="https://res.cloudinary.com/dod56svuf/image/upload/v1751876631/softwareVip.png" alt="SistemasVIP Logo" width={70} height={70} />
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <Link href="#plataformas" className="hover:text-white transition-colors">Plataformas</Link>
        <Link href="#beneficios" className="hover:text-white transition-colors">Beneficios</Link>
        <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
      </nav>
      <Link href="/login" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm">
        Iniciar Sesión
      </Link>
    </div>
  </header>
);

// --- Componente de Tarjeta Top 10 (Diseño Mejorado) ---
const TopServiceCarousel = ({ services }: { services: { rank: number; imageUrl: string; alt: string }[] }) => {
    const [index, setIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [servicesPerPage, setServicesPerPage] = useState(4);

    useEffect(() => {
        const getServicesPerPage = () => {
            if (typeof window !== 'undefined') {
                if (window.innerWidth >= 1280) return 5;
                if (window.innerWidth >= 1024) return 4;
                if (window.innerWidth >= 768) return 3;
            }
            return 2;
        };
        
        const handleResize = () => setServicesPerPage(getServicesPerPage());
        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const totalPages = Math.ceil(services.length / servicesPerPage);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setIndex(prev => (prev + 1) % totalPages);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setIndex(prev => (prev - 1 + totalPages) % totalPages);
    };
    
    const visibleServices = services.slice(index * servicesPerPage, (index * servicesPerPage) + servicesPerPage);

    return (
        <div className="relative">
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
                 <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        // ✅ SOLUCIÓN: Se aumentó el espaciado entre las tarjetas
                        className="flex items-end space-x-6 md:space-x-12"
                    >
                        {visibleServices.map(service => (
                             <motion.div key={service.rank} className="relative flex items-end group">
                                {/* Número con z-index más alto y nuevo estilo */}
                                <span 
                                    className="absolute bottom-0 left-0 text-6xl md:text-9xl font-black text-black transition-transform duration-300 group-hover:scale-110 z-20" 
                                    style={{ WebkitTextStroke: '4px white', transform: 'translateX(-40%)' }}
                                >
                                    {service.rank}
                                </span>
                                {/* Imagen con z-index más bajo */}
                                <div className="relative w-32 h-48 md:w-48 md:h-64 flex-shrink-0 z-10">
                                    <Image src={service.imageUrl} alt={service.alt} layout="fill" objectFit="cover" className="rounded-md transition-transform duration-300 group-hover:scale-110 shadow-lg" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
             <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/30 p-3 rounded-full hover:bg-black/60 transition-colors z-30 -translate-x-4 md:-translate-x-6">
                <ChevronLeft size={32}/>
            </button>
            <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/30 p-3 rounded-full hover:bg-black/60 transition-colors z-30 translate-x-4 md:translate-x-6">
                <ChevronRight size={32}/>
            </button>
        </div>
    );
};


// --- Componente de Pregunta Frecuente (Acordeón) ---
const FaqItem = ({ q, a }: { q: string; a: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-800">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-5 px-6 text-xl md:text-2xl text-white hover:bg-slate-800/50 transition-colors">
                <span>{q}</span>
                <motion.div animate={{ rotate: isOpen ? 45 : 0 }}><Plus size={32}/></motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 bg-slate-800 text-lg text-slate-300">
                           {a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Componente Separador de Sección ---
const SectionSeparator = () => (
    <div className="w-full h-24 md:h-32 -mt-12 md:-mt-20 relative z-10">
        <svg
            className="w-full h-full"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id="glow" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1E293B" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path 
                d="M0,80 C360,130 1080,-20 1440,80 L1440,120 L0,120 Z" 
                fill="url(#glow)"
                fillOpacity="0.1"
            />
            <path 
                d="M0,80 C360,130 1080,-20 1440,80" 
                stroke="#3B82F6" 
                strokeWidth="1.5"
                fill="none" 
                strokeOpacity="0.4"
            />
        </svg>
    </div>
);


// --- Página Principal (Landing Page) ---
const HomePage: React.FC = () => {
    const topServices = [
        { rank: 1, imageUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1752225079/juegodelcalamar_wnqozh.webp', alt: 'El Juego del Calamar' },
        { rank: 2, imageUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1752225079/harta_sbpncy.webp', alt: 'Harta' },
        { rank: 3, imageUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1752225078/rosariotijeras_kwqnsm.webp', alt: 'Rosario Tijeras' },
        { rank: 4, imageUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1752225077/elmundonegro_buunpe.webp', alt: 'El Mundo Negro' },
        { rank: 5, imageUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1752225076/laviejaguardia_zdqtmi.webp', alt: 'La Vieja Guardia' },
        { rank: 6, imageUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1752225076/alertaextrema_hpro2t.webp', alt: 'Alerta Extrema' },
        { rank: 7, imageUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1752225075/madea_v8xzqm.webp', alt: 'Madea' },
        { rank: 8, imageUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1752225075/los7osos_huxfyt.webp', alt: 'Los 7 Osos' },
    ];

    const platforms = [
        { name: 'Netflix', iconUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1751950036/icons8-netflix-144_ywadol.png' },
        { name: 'Disney+', iconUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1751950036/icons8-disney-144_elknxn.png' },
        { name: 'Spotify', iconUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1751950036/icons8-spotify-144_xyxltg.png' },
        { name: 'YouTube', iconUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1751950036/icons8-youtube-144_ypxgvn.png' },
        { name: 'Canva', iconUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1751950036/icons8-canva-144_zts4l1.png' },
        { name: 'Crunchyroll', iconUrl: 'https://res.cloudinary.com/dod56svuf/image/upload/v1751950036/icons8-crunchyroll-144_rrqnm3.png' },
    ];

    const faqs = [
        { q: "¿Qué es SistemasVIP.shop?", a: "Es una plataforma online donde puedes adquirir acceso a cuentas premium de servicios de streaming y herramientas digitales a precios muy competitivos, con entrega segura e inmediata." },
        { q: "¿Cómo recibo mi cuenta?", a: "Una vez completado tu pago, recibirás los detalles de acceso directamente en tu panel de usuario, en la sección 'Mis Órdenes'. El proceso es automático y toma solo unos minutos." },
        { q: "¿Es seguro comprar aquí?", a: "Totalmente. Utilizamos procesos seguros para proteger tus datos y garantizar que todas las cuentas que ofrecemos son funcionales y privadas para ti durante el período de tu compra." },
        { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos pagos a través de Yape y Plin, los métodos más populares y seguros en Perú. El proceso es rápido y se valida a través de nuestro chat de WhatsApp." },
    ];

  return (
    <div className="bg-slate-900 text-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image src="https://res.cloudinary.com/dod56svuf/image/upload/v1752225089/softwarevipflayer_jexo6s.jpg" alt="Servicios de Streaming" layout="fill" objectFit="cover" className="opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
            >
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                    Cuentas Premium, Herramientas Digitales y Más.
                </h1>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-300">
                    Acceso ilimitado. Precios sin competencia. Comienza ahora.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg shadow-blue-600/20">
                        Crear Cuenta Gratis <ChevronRight size={20} />
                    </Link>
                </div>
            </motion.div>
        </section>

        <SectionSeparator />

        {/* Top Services Section */}
        <section className="py-12 md:py-20 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-white mb-8">Top 10 Servicios en Perú</h2>
                <TopServiceCarousel services={topServices} />
            </div>
        </section>
        
        {/* Platforms Section */}
        <section id="plataformas" className="py-12 md:py-20 bg-slate-900/50">
            <div className="max-w-5xl mx-auto text-center px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Todas tus Plataformas Favoritas</h2>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-400">
                    Desde el mejor cine hasta las herramientas de productividad más potentes. Todo en un solo lugar.
                </p>
                <div className="mt-12 flex flex-wrap justify-center items-center gap-8">
                    {platforms.map(p => <Image key={p.name} src={p.iconUrl} alt={p.name} width={120} height={40} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300" />)}
                </div>
            </div>
        </section>

        {/* More Reasons to Join Section */}
        <section id="beneficios" className="py-20 px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-left"><h2 className="text-3xl font-bold text-white">Más Razones para Unirte</h2></div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700"><h3 className="text-xl font-bold text-white mb-2">Disfruta en tu TV</h3><p className="text-slate-400">Ve en Smart TV, PlayStation, Xbox, Chromecast, Apple TV, reproductores de Blu-ray y más.</p></div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700"><h3 className="text-xl font-bold text-white mb-2">Descarga y disfruta offline</h3><p className="text-slate-400">Guarda tus favoritos fácilmente y siempre tendrás algo que ver.</p></div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700"><h3 className="text-xl font-bold text-white mb-2">Acceso en todo lugar</h3><p className="text-slate-400">Disfruta en tu teléfono, tablet, computadora y TV sin costo extra.</p></div>
            </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">Preguntas Frecuentes</h2>
                <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                    {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-sm">
            <p className="mb-8">¿Preguntas? Contacta a <a href="#" className="hover:text-white underline">Soporte</a></p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-3"><Link href="#" className="block hover:text-white">FAQ</Link><Link href="#" className="block hover:text-white">Privacidad</Link></div>
                <div className="space-y-3"><Link href="#" className="block hover:text-white">Centro de ayuda</Link><Link href="#" className="block hover:text-white">Preferencias de cookies</Link></div>
                <div className="space-y-3"><Link href="#" className="block hover:text-white">Tienda de Servicios</Link><Link href="#" className="block hover:text-white">Términos de uso</Link></div>
                <div className="space-y-3"><Link href="#" className="block hover:text-white">Prensa</Link><Link href="#" className="block hover:text-white">Contáctanos</Link></div>
            </div>
             <p className="mt-10">&copy; {new Date().getFullYear()} SistemasVIP.shop</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;