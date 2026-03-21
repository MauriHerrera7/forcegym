import React from 'react'
import Image from 'next/image'
import Container from '@/components/Container'

const SpaceExperience: React.FC = () => {
  return (
    <section className="bg-black py-24 md:py-32 overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-20 md:mb-32">
          <span className="inline-block text-[#FF6B35] font-black uppercase tracking-[0.4em] text-sm mb-4">
            NUESTRAS INSTALACIONES
          </span>
          <h2 className="text-white font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter leading-none">
            Diseñado para tu{' '}
            <span className="text-red-600 bg-clip-text bg-gradient-to-r from-[#DC143C] to-[#FF6B35]">
              máximo rendimiento
            </span>
          </h2>
        </div>

        <div className="space-y-16 md:space-y-24">
          {/* Experience 1: Cardio Zone */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900">
                <Image 
                  src="https://res.cloudinary.com/dry6dvzoj/image/upload/v1771291667/GYM_eedj7p.jpg" 
                  alt="ForceGym Zona Cardiovascular"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#DC143C]/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#DC143C]" />
                <span className="text-[#DC143C] font-bold uppercase tracking-widest text-[10px]">
                  ZONA CARDIOVASCULAR
                </span>
              </div>
              
              <h3 className="text-white font-black text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
                Resistencia, Energía y Alto Rendimiento
              </h3>
              
              <div className="w-16 h-1 bg-gradient-to-r from-[#DC143C] to-[#FF6B35]" />
              
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                Un espacio dinámico pensado para mejorar tu capacidad cardiovascular y tu resistencia física. Contamos con cintas, bicicletas, elípticos y zonas funcionales para entrenamientos HIIT y circuitos intensos. Ideal para quemar grasa, aumentar tu resistencia y potenciar tu condición física general.
              </p>
            </div>
          </div>

          {/* Experience 2: Strength Zone */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900">
                <Image 
                  src="https://res.cloudinary.com/dry6dvzoj/image/upload/v1757738254/gym_ntrfn0.png" 
                  alt="ForceGym Piso de Musculación"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
            </div>
            
            <div className="order-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FF1493]/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#FF1493]" />
                <span className="text-[#FF1493] font-bold uppercase tracking-widest text-[10px]">
                  PISO DE MUSCULACIÓN
                </span>
              </div>
              
              <h3 className="text-white font-black text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
                Entrenamiento de Fuerza de Alto Nivel
              </h3>
              
              <div className="w-16 h-1 bg-gradient-to-r from-[#FF1493] to-[#DC143C]" />
              
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                Nuestro piso de musculación está equipado con máquinas de última generación, racks profesionales y peso libre para que lleves tu fuerza al siguiente nivel. Diseñado para maximizar tu rendimiento, mejorar tu técnica y ayudarte a construir masa muscular de forma segura y efectiva. Aquí se entrena en serio.
              </p>
            </div>
          </div>

          {/* Experience 3: Locker Rooms */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900">
                <Image 
                  src="https://res.cloudinary.com/dry6dvzoj/image/upload/v1771291365/Banheiros_Masculinos___Chuveiros_z7iped.jpg" 
                  alt="ForceGym Vestuarios"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FF6B35]/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                <span className="text-[#FF6B35] font-bold uppercase tracking-widest text-[10px]">
                  INSTALACIONES
                </span>
              </div>
              
              <h3 className="text-white font-black text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
                Comodidad Después del Esfuerzo
              </h3>
              
              <div className="w-16 h-1 bg-gradient-to-r from-[#FF6B35] to-[#DC143C]" />
              
              <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                Instalaciones amplias, modernas y siempre limpias para que puedas relajarte después de entrenar. Duchas con agua caliente, vestuarios cómodos y espacios pensados para tu confort y privacidad. Entrenás fuerte, te vas renovado.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default SpaceExperience