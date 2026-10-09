import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

const NotFound = () => (
  <main className="lucid-app min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
    <span className="lucid-ring mb-8 !h-12 !w-12" aria-hidden="true" />
    <p className="lucid-overline">A little off the map</p>
    <h1 className="lucid-display mt-3 text-8xl text-sky-300 md:text-9xl">404</h1>
    <div className="mt-6 h-52 w-full max-w-xl overflow-hidden rounded-2xl border border-sky-300/20 md:h-72">
      <img src="/dream-art/door-at-horizon.png" alt="A glowing doorway at the horizon" className="h-full w-full object-cover"/>
    </div>
    <h2 className="lucid-display mt-7 text-3xl md:text-4xl">This dream took another path.</h2>
    <p className="mt-3 max-w-sm text-slate-400">The page you’re looking for isn’t here. Your dream worlds are still waiting.</p>
    <div className="mt-7 flex gap-3"><Link className="lucid-button" to="/"><ArrowLeft size={17}/> Back Home</Link><Link className="lucid-button-secondary" to="/lucid-repo"><Compass size={17}/> Explore</Link></div>
  </main>
);

export default NotFound;
