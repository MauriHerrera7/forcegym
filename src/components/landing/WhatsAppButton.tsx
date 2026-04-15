'use client';

import React from 'react';
import { motion } from 'framer-motion';

const WhatsAppButton: React.FC = () => {
  // Configuración del botón
  const phoneNumber = '5492615552184'; // Reemplazar con el número real
  const message = '¡Hola! Me gustaría obtener más información sobre ForceGym.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: 1, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className="fixed bottom-8 right-8 z-[100]"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center underline-none"
      >
        {/* Subtle Outer Glow (Red) - Faster but smoother */}
        <div className="absolute inset-0 bg-apple-red/25 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Tooltip - Premium Style */}
        <div className="absolute bottom-full right-0 mb-6 px-4 py-2 bg-apple-black/95 backdrop-blur-md border border-white/10 rounded-full text-white text-[12px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none shadow-2xl">
          Contactar con la élite
        </div>

        {/* Button Container - Extremely Massive Scale */}
        <div className="relative bg-apple-black/60 backdrop-blur-2xl text-white p-6 md:p-10 rounded-full border border-white/10 shadow-3xl transition-all duration-300 group-hover:bg-apple-black/95 group-hover:border-apple-red/40 overflow-hidden">
          {/* Internal Subtle Pulse */}
          <div className="absolute inset-0 bg-gradient-to-tr from-apple-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 md:w-16 md:h-16 fill-current relative z-10 transition-transform duration-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.123.551 4.197 1.595 6.035L0 24l6.096-1.6c1.774.966 3.77 1.477 5.804 1.478h.006c6.637 0 12.032-5.396 12.035-12.03a11.85 11.85 0 00-3.484-8.423" />
          </svg>
        </div>
      </a>
    </motion.div>
  );
};

export default WhatsAppButton;
