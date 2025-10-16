// src/components/Hero.jsx

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-24 sm:py-32">
      {/* Background Grid & Spotlight */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

        {/* Radial Spotlight Gradient */}
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(120%_100%_at_50%_20%,rgba(79,70,229,0.3)_0%,rgba(79,70,229,0)_100%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Glitch Effect Heading */}
        <h1 className="glitch text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl" data-text="WELCOME TO MY REALM">
          WELCOME TO MY REALM
        </h1>

        {/* Animated Subheading */}
        <p className="mt-6 animate-fade-in-up text-lg leading-8 text-slate-300 [animation-delay:0.5s]">
          Crafting immersive and futuristic digital experiences. The line between reality and code is blurring.
        </p>

        {/* Interactive Buttons */}
        <div className="mt-10 flex animate-fade-in-up items-center justify-center gap-x-6 [animation-delay:1s]">
          <a
            href="#projects"
            className="group relative inline-block rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <span className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
            <span className="relative">Explore Projects</span>
          </a>
          <a
            href="#contact"
            className="group relative text-sm font-semibold leading-6 text-white transition-colors duration-300 hover:text-indigo-400"
          >
            Initiate Contact <span aria-hidden="true">→</span>
            {/* Underline effect */}
            <span className="absolute bottom-0 left-0 h-0.5 w-full origin-right scale-x-0 bg-indigo-400 transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100"></span>
          </a>
        </div>
      </div>
    </section>
  );
}