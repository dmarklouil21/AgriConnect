import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tractor, 
  ShoppingBag, 
  Shield, 
  Menu, 
  X, 
  ArrowRight, 
  Sun, 
  Heart, 
  Truck,
  Rocket,
  Construction,
  Sprout
} from 'lucide-react';

// --- Shared Components ---

const Button = ({ children, variant = 'primary', className = '', onClick, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-full font-bold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-white text-slate-700 border-2 border-slate-100 hover:border-emerald-200 hover:text-emerald-600",
    outline: "border-2 border-white text-white hover:bg-white/10"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ title, description, icon: Icon, color, linkType }) => {
  const colors = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:border-emerald-300",
    orange: "bg-orange-50 text-orange-500 border-orange-100 group-hover:border-orange-300",
    blue: "bg-blue-50 text-blue-500 border-blue-100 group-hover:border-blue-300",
  };

  return (
    <div className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${colors[color]}`}>
        <Icon size={32} strokeWidth={2.5} />
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed mb-8 flex-grow">
        {description}
      </p>

      <div className="flex flex-col gap-3 mt-auto">
        <a 
          href={`/login/${linkType}`}
          className="w-full py-3 rounded-xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-center"
        >
          Log In
        </a>
        {linkType !== 'admin' && (
          <a 
            href={`/register/${linkType}`} 
            className="w-full py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors text-center"
          >
            Create Account
          </a>
        )}
      </div>
    </div>
  );
};

// --- Coming Soon Page ---

const ComingSoonPage = ({ title, subtitle, onBack }) => (
  <section className="min-h-screen pt-32 pb-20 overflow-hidden bg-slate-50 flex items-center justify-center">
    <div className="container mx-auto px-6 text-center relative">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-75"></div>

      <div className="relative z-10 max-w-3xl mx-auto bg-white/50 backdrop-blur-xl border border-white p-12 rounded-[3rem] shadow-2xl shadow-emerald-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-emerald-500 to-lime-400 rounded-3xl mb-8 text-white shadow-lg shadow-emerald-200 rotate-3 hover:rotate-0 transition-transform">
           <Rocket size={40} strokeWidth={2} />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          {title} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-lime-500">
             Coming Soon!
          </span>
        </h1>
        
        <p className="text-xl text-slate-500 mb-10 leading-relaxed">
          {subtitle}
          <br className="hidden md:block" />
          We are working hard to cultivate this feature. Stay tuned for updates!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="primary" onClick={onBack}>
            Back to Home
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/register/consumer'}>
             Join Waitlist
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm font-medium text-slate-400">
          <Construction size={16} />
          <span>Under Construction • Expected Launch Q4 2026</span>
        </div>
      </div>
    </div>
  </section>
);

// --- Main Application Layout ---

const Navbar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (page) => {
    setIsOpen(false);
    onNavigate(page);
  }

  const handleClick = () => {
    navigate('/consumer');
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-lime-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-lime-200">
              <Sun size={24} fill="currentColor" className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Agri<span className="text-emerald-500">Connect</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-semibold text-slate-500">
            <a href="/consumer" className="hover:text-emerald-500 transition-colors">Marketplace</a>
            <button onClick={() => onNavigate('farms')} className="hover:text-emerald-500 transition-colors">Our Farms</button>
            <button onClick={() => onNavigate('community')} className="hover:text-emerald-500 transition-colors">Community</button>
            <Button variant="primary" className="py-2 px-5 text-sm" onClick={handleClick}>
              Start Shopping
            </Button>
          </div>

          <button className="md:hidden text-slate-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-6 animate-fade-in">
          <div className="flex flex-col gap-4">
            <a href="/consumer" className="text-lg font-semibold text-slate-600">Marketplace</a>
            <button onClick={() => handleNavClick('farms')} className="text-lg font-semibold text-slate-600 text-left">Our Farms</button>
            <button onClick={() => handleNavClick('community')} className="text-lg font-semibold text-slate-600 text-left">Community</button>
            <Button variant="primary" className="w-full justify-center" onClick={handleClick}>Start Shopping</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ onNavigate }) => (
  <section className="pt-32 pb-20 overflow-hidden bg-slate-50">
    <div className="container mx-auto px-6 text-center relative">
      {/* Abstract Shapes */}
      <div className="absolute top-0 left-10 w-64 h-64 bg-lime-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-10 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-64 h-64 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-tight">
          Good Food Should Be <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-lime-500">
            Simple & Honest.
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          We're cutting out the middlemen to bring you brighter flavors, 
          fairer prices, and a direct connection to the people who grow your food.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/consumer" className="w-full sm:w-auto">
             <Button variant="primary" className="w-full">
               Browse the Market <ArrowRight size={20} />
             </Button>
          </a>
          {/* Updated Button to trigger navigation to stories */}
          <Button variant="secondary" onClick={() => onNavigate('stories')}>
            View Success Stories
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-3 gap-12 text-center mb-20">
        {[
          { icon: Sun, title: "100% Freshness", text: "Harvested within 24 hours of delivery." },
          { icon: Heart, title: "Fair Trade", text: "Farmers keep 90% of every sale." },
          { icon: Truck, title: "Eco Shipping", text: "Carbon-neutral local delivery fleet." }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-12 h-12 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center mb-4">
              <item.icon size={24} />
            </div>
            <h4 className="font-bold text-lg text-slate-800 mb-2">{item.title}</h4>
            <p className="text-slate-500">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Choose Your Path
        </h2>
        <p className="text-slate-500 mt-4">Join our growing community today.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card 
          title="For Farmers"
          description="Focus on growing, not selling. We provide the storefront, payments, and marketing tools you need."
          icon={Tractor}
          color="green"
          linkType="farmer"
        />
        <Card 
          title="For Shoppers"
          description="Get a box of seasonal joy delivered to your door. Know exactly where your food comes from."
          icon={ShoppingBag}
          color="orange"
          linkType="consumer"
        />
        <Card 
          title="Platform Admin"
          description="Manage the ecosystem. Verify certifications, handle logistics, and support the community."
          icon={Shield}
          color="blue"
          linkType="admin"
        />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-900 text-white py-12">
    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold mb-2">AgriConnect</h2>
        <p className="text-slate-400">Making local food accessible to everyone.</p>
      </div>
      <div className="flex gap-8 text-slate-400 font-medium">
        <a href="#" className="hover:text-lime-400 transition-colors">Privacy</a>
        <a href="#" className="hover:text-lime-400 transition-colors">Terms</a>
        <a href="#" className="hover:text-lime-400 transition-colors">Contact</a>
      </div>
    </div>
  </footer>
);

// --- Main App ---

const AgriConnectVibrant = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderContent = () => {
    switch (currentPage) {
      case 'farms':
        return (
          <ComingSoonPage 
            title="Meet Our Farmers" 
            subtitle="We are currently filming stories and gathering data from our partner farms. Soon you'll be able to see exactly where your food grows."
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'community':
        return (
          <ComingSoonPage 
            title="Community Hub" 
            subtitle="Recipes, forums, and local events are on their way. We are building a space for food lovers to connect."
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'stories': // Added route for Success Stories
        return (
          <ComingSoonPage 
            title="Harvesting Success" 
            subtitle="We're gathering inspiring tales from our community. Soon you'll be able to read about how local farmers are growing their businesses and families are eating better."
            onBack={() => setCurrentPage('home')}
          />
        );
      default:
        return (
          <>
            <Hero onNavigate={setCurrentPage} />
            <Features />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-lime-200 selection:text-emerald-900 flex flex-col">
      <Navbar onNavigate={setCurrentPage} />
      <main className="flex-grow bg-slate-50">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default AgriConnectVibrant;