import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VisualizerShowcase = () => {
  const steps = [
    {
      number: "01",
      title: "Choose Your Space",
      description:
        "Select from our library of room templates or begin anew with our professionals.",
      color: "bg-soft-sage/20",
    },
    {
      number: "02",
      title: "Place Your Furniture",
      description: "Drag and drop furniture from our catalog or import your own 3D models.",
      color: "bg-accent-gold/20",
    },
    {
      number: "03",
      title: "Experience Your Design",
      description: "Walk through your space in virtual reality or share with others.",
      color: "bg-deep-indigo/10",
    },
  ];

  return (
    <div id="visualizer" className="py-20 container mx-auto">
      <div className="text-center mb-16 px-4">
        <h2 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">
          Visualize Before You Realize
        </h2>
        <p className="text-lg text-deep-indigo/80 max-w-2xl mx-auto">
          See your dream space come to life before making any purchases. Our 3D visualization tool
          helps you make confident design decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {steps.map((step, index) => (
          <div key={index} className={cn("rounded-lg p-6 perspective-card", step.color)}>
            <span className="inline-block font-playfair text-5xl font-bold text-accent-gold/20 mb-4">
              {step.number}
            </span>
            <h3 className="text-xl font-playfair font-semibold mb-3">{step.title}</h3>
            <p className="text-deep-indigo/80 mb-4">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button className="gold-button inline-flex items-center">
          Try Now <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default VisualizerShowcase;
