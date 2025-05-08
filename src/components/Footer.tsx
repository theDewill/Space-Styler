import { Instagram, Facebook, Linkedin, Mail, Package, LampWallUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer id="about" className="bg-deep-indigo text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <LampWallUp className="h-6 w-6 text-accent-gold mr-2" />
              <span className="font-playfair text-xl font-semibold">Space Styler</span>
            </div>
            <p className="text-white/70 mb-6">
              Transform your living spaces with our immersive 3D visualization experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-accent-gold">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-accent-gold">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-accent-gold">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-playfair text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Collections", "Inspiration", "About Us"].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-playfair text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {[
                "FAQ",
                "Shipping & Returns",
                "Contact Us",
                "Privacy Policy",
                "Terms & Conditions",
              ].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-playfair text-lg font-semibold mb-4">
              Design Inspiration Delivered
            </h3>
            <p className="text-white/70 mb-4">
              Subscribe to our newsletter for exclusive design tips and offers.
            </p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-r-none"
              />
              <Button
                variant="default"
                className="bg-accent-gold hover:bg-accent-gold/90 rounded-l-none"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Space Styler. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-white/70 text-sm hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/70 text-sm hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
