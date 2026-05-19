import { Link } from "react-router";
import { ArrowRight, Shield, Users, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      desc: "We believe in complete honesty. Every vehicle comes with a full history report and our 200-point inspection results.",
    },
    {
      icon: Award,
      title: "Excellence",
      desc: "Only the finest vehicles make it to our showroom. We curate our inventory with an uncompromising eye for quality.",
    },
    {
      icon: Users,
      title: "Customer First",
      desc: "Your satisfaction is our success. Our dedicated team provides personalized service at every step of your journey.",
    },
    {
      icon: Clock,
      title: "Efficiency",
      desc: "We respect your time. Our streamlined process ensures you spend less time waiting and more time driving.",
    },
  ];

  const team = [
    { name: "Omar Al-Harbi", role: "Founder & CEO", initials: "OA" },
    { name: "Faisal Bin Turki", role: "Sales Director", initials: "FT" },
    { name: "Nasser Al-Qahtani", role: "Head of Operations", initials: "NQ" },
    { name: "Badr Al-Rashid", role: "Customer Relations", initials: "BR" },
  ];

  return (
    <div className="min-h-screen bg-dark pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">About Us</span>
            <div className="h-px w-12 bg-gold" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Redefining the
            <br />
            <span className="text-gold">Car Buying Experience</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Drive X was founded with a simple mission: to make buying, renting, and managing vehicles faster, clearer, and easier for showroom teams and visitors.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative">
            <img
              src="/showroom.jpg"
              alt="Drive X Showroom"
              className="rounded-2xl border border-gold/20 shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-dark-card border border-gold/20 rounded-xl p-6 shadow-xl">
              <p className="text-gold text-3xl font-bold">15+</p>
              <p className="text-white/60 text-sm">Years of Excellence</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Our Story</h2>
            <p className="text-white/60 leading-relaxed">
              What began as a showroom workflow idea has grown into a complete digital marketplace model. Drive X connects public vehicle discovery with structured lead tracking, admin inventory control, and commission-aware deal management.
            </p>
            <p className="text-white/60 leading-relaxed">
              Today, Drive X is designed to support premium vehicle listings, buy and rent requests, delivery capture, and operational analytics from one controlled system.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-dark-card border border-gold/10 rounded-xl p-4">
                <p className="text-gold text-2xl font-bold">2,500+</p>
                <p className="text-white/60 text-sm">Cars Sold</p>
              </div>
              <div className="bg-dark-card border border-gold/10 rounded-xl p-4">
                <p className="text-gold text-2xl font-bold">25+</p>
                <p className="text-white/60 text-sm">Premium Brands</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">Our Principles</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-dark-card border border-gold/10 hover:border-gold/40 rounded-xl p-8 text-center group hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold group-hover:shadow-glow transition-all">
                  <value.icon className="w-7 h-7 text-gold group-hover:text-dark" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{value.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <span className="text-gold text-sm font-medium tracking-[0.2em] uppercase">The Experts</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-dark-card border border-gold/10 rounded-xl p-6 text-center group hover:border-gold/40 transition-all">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-dark font-bold text-xl mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="text-white font-bold">{member.name}</h3>
                <p className="text-gold text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-dark-card border border-gold/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience the Drive X Difference?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Visit our showroom or browse our inventory online to find your perfect vehicle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inventory">
              <Button className="bg-gold hover:bg-gold-light text-dark font-bold px-8 py-6 shadow-glow hover:shadow-glow-lg transition-all">
                Browse Inventory
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 px-8 py-6">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
