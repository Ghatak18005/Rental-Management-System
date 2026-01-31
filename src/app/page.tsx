import { Navbar } from "@/components/navbar";
import { ArrowRight, Box, Calendar, CreditCard, FileText, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-2">
            Rent Anything. Manage Everything.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            The complete ecosystem for rental businesses. From quotations to returns, 
            manage your inventory, invoices, and vendors in one unified platform.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
              Browse Inventory
            </button>
            <button className="px-8 py-4 rounded-xl bg-card border border-gray-200 dark:border-gray-700 text-foreground font-bold text-lg hover:bg-accent transition-colors flex items-center gap-2">
              Become a Vendor <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[128px]"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-[128px]"></div>
        </div>
      </section>

      {/* HOW IT WORKS (The Rental Lifecycle) */}
      <section className="py-20 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Complete Rental Lifecycle</h2>
            <p className="text-gray-600 dark:text-gray-400">Streamlined workflow for Customers, Vendors, and Admins.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                icon: <FileText className="h-8 w-8 text-primary" />, 
                title: "1. Quotation", 
                desc: "Browse products and request a price proposal. Edit until you are ready." 
              },
              { 
                icon: <Calendar className="h-8 w-8 text-primary" />, 
                title: "2. Reservation", 
                desc: "Confirm order to auto-block inventory. No double-bookings allowed." 
              },
              { 
                icon: <CreditCard className="h-8 w-8 text-primary" />, 
                title: "3. Payment", 
                desc: "Pay upfront or partial security deposits via secure gateways." 
              },
              { 
                icon: <Box className="h-8 w-8 text-primary" />, 
                title: "4. Return", 
                desc: "Automated documents for pickup and return. Late fees applied automatically." 
              },
            ].map((step, index) => (
              <div key={index} className="bg-card p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Categories</h2>
              <p className="text-gray-500">Find exactly what you need for your next project.</p>
            </div>
            <a href="#" className="text-primary font-semibold hover:underline">View All</a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Mock Category Cards */}
             {['Electronics', 'Heavy Machinery', 'Furniture'].map((cat, i) => (
               <div key={i} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer">
                 <div className={`absolute inset-0 bg-gradient-to-br ${i === 0 ? 'from-blue-600 to-purple-600' : i === 1 ? 'from-emerald-600 to-teal-600' : 'from-orange-500 to-red-500'} opacity-80 group-hover:scale-105 transition-transform duration-500`}></div>
                 <div className="absolute inset-0 flex flex-col justify-end p-8">
                   <h3 className="text-2xl font-bold text-white">{cat}</h3>
                   <p className="text-white/80">Starting at $50/day</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* TRUST INDICATORS */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-12">Trusted by 500+ Businesses</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Placeholders for logos */}
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-card border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-primary p-1.5 rounded-lg">
                  {/* <ShoppingBag className="h-5 w-5 text-primary-foreground" /> */}
               </div>
               <span className="font-bold text-lg">RentFlow</span>
            </div>
            <p className="text-gray-500 text-sm">Empowering the rental economy with seamless tech solutions.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary">Browse Products</a></li>
              <li><a href="#" className="hover:text-primary">Vendor Portal</a></li>
              <li><a href="#" className="hover:text-primary">Pricing</a></li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold mb-4">Support</h4>
             <ul className="space-y-2 text-sm text-gray-500">
               <li><a href="#" className="hover:text-primary">Help Center</a></li>
               <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
               <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Stay Updated</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter email" className="bg-background border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary" />
              <button className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-bold">Go</button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}