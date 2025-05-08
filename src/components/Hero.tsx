import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ModelViewer from "./ModelViewer";

const Hero = () => {
  return (
    <div className="pt-24 md:pt-32 pb-16 container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4">
        <div className="space-y-6 md:pr-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-semibold leading-tight">
            Stylish Furniture for Every Space
          </h1>
          <p className="text-lg text-deep-indigo/80 font-nunito md:w-4/5">
            Discover timeless designs and modern essentials at Space Styler. Visualize each piece in
            lifelike 3D and see exactly how it fits into your home before you buy.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <a href="#collections">
              <Button className="gold-button">Start Browsing</Button>
            </a>
            <a
              href="#gallery"
              className="flex items-center text-deep-indigo font-medium animated-underline"
            >
              Explore Gallery <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
        <div className="relative h-80 md:h-[500px] w-full rounded-lg overflow-hidden">
          <ModelViewer />
        </div>
      </div>
    </div>
  );
};

export default Hero;
