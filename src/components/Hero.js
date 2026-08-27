import { Button } from './Button.js';

export function Hero() {
  return `<main class="relative w-full flex flex-col items-center justify-center overflow-hidden min-h-[75svh] lg:min-h-0 lg:h-[78vh] pt-24 md:pt-28 pb-20 md:pb-16">
    <video class="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-center z-0" src="/assets/Vídeo/RPG_combat_scene_202604241613.mp4" autoplay loop muted playsinline poster="/assets/Img/pexels-cris-ramos-1837545236-30835420.jpg" aria-label="Cena de combate de RPG"></video>
    <div class="absolute inset-0 z-0 pointer-events-none backdrop-blur-[1px] md:backdrop-blur-[1px]" style="background: radial-gradient(ellipse at 25% 45%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 50%, rgba(15,23,42,0.85) 100%);"></div>
    <div class="absolute inset-0 z-0 pointer-events-none lg:hidden" style="background: linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 80%, rgba(255,255,255,0) 100%);"></div>
    <div class="absolute inset-0 z-0 pointer-events-none" style="background: linear-gradient(to bottom, rgba(248,250,252,0) 65%, rgba(248,250,252,0.6) 85%, rgba(248,250,252,1) 100%);"></div>
    <div class="absolute top-[10%] -left-[10%] md:left-[10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-blue-100 opacity-50 blur-[80px] md:blur-[100px] animate-pulse" style="animation-duration: 8s;"></div>
    <div class="absolute top-[20%] right-[0%] md:right-[5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-sky-100 opacity-40 blur-[60px] md:blur-[80px] float-anim" style="animation-duration: 12s;"></div>
    <div class="relative z-10 w-full px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] flex flex-col items-start flex-1 justify-center mt-8 lg:mt-0">
      <div class="text-left w-full animate-slide-up animate-delay-100 pointer-events-none mb-4 md:mb-12">
        <h1 class="text-[clamp(2.5rem,8vw,4.5rem)] font-bold tracking-tighter leading-[1.05] sm:leading-[1.1] font-outfit drop-shadow-md text-slate-900">Sua próxima grande aventura <br class="hidden lg:inline">começa com um apoio.</h1>
        <p class="mt-4 sm:mt-6 text-[17px] sm:text-xl text-slate-700 md:text-slate-600 leading-snug sm:leading-relaxed font-medium drop-shadow-sm max-w-[90%] sm:max-w-xl lg:max-w-3xl">Descubra e apoie campanhas de RPG independentes antes de todo mundo.<br>Ajude essas histórias a saírem do papel.</p>
      </div>
    </div>
    <div class="absolute bottom-8 lg:bottom-16 left-0 w-full z-20 px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] flex flex-col sm:flex-row justify-between items-center sm:items-end pointer-events-auto gap-3 sm:gap-4 pb-2 md:pb-0">
      <div class="flex items-center w-full sm:w-auto animate-slide-up" style="animation-delay: 200ms;">
        ${Button({ label: 'Explorar campanhas ativas' })}
      </div>
      ${Button({ label: 'Criar campanha', variant: 'secondary', extraClass: '', attrs: 'id="hero-create-campaign-btn" style="animation-delay: 300ms;"' })}
    </div>
  </main>`;
}
