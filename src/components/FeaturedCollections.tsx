
import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const collections = [
  {
    id: "col_1",
    name: "Nordic Essentials",
    description: "Minimal Scandinavian designs",
    startingPrice: "$299",
    thumbnail: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "col_2",
    name: "Urban Industrial",
    description: "Raw materials, refined design",
    startingPrice: "$349",
    thumbnail: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "col_3",
    name: "Modern Luxe",
    description: "Contemporary elegance",
    startingPrice: "$499",
    thumbnail: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "col_4",
    name: "Coastal Living",
    description: "Airy beachside comfort",
    startingPrice: "$399",
    thumbnail: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "col_5",
    name: "Minimalist Zen",
    description: "Simple, balanced, peaceful",
    startingPrice: "$289",
    thumbnail: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80",
  },
];

const FeaturedCollections = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      
      if (direction === "left") {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
      
      setScrollPosition(container.scrollLeft);
    }
  };

  return (
    <div id="collections" className="py-20 bg-deep-indigo/5">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-10 px-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold mb-2">
              Featured Collections
            </h2>
            <p className="text-deep-indigo/80">
              Curated selection of our finest furniture ensembles
            </p>
          </div>
          <div className="hidden md:flex space-x-3">
            <button 
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-deep-indigo/20 flex items-center justify-center hover:bg-deep-indigo hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ArrowLeft size={18} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-deep-indigo/20 flex items-center justify-center hover:bg-deep-indigo hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        
        <div 
          className="flex overflow-x-auto scrollbar-hide snap-x pb-6 px-4" 
          ref={scrollContainerRef}
          style={{ scrollBehavior: "smooth" }}
        >
          {collections.map((collection) => (
            <div 
              key={collection.id}
              className="min-w-[280px] md:min-w-[350px] snap-start mr-6 perspective-card"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md h-full">
                <div className="h-48 md:h-64 relative overflow-hidden">
                  <img 
                    src={collection.thumbnail} 
                    alt={collection.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2">
                    <Box className="h-4 w-4 text-accent-gold" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-playfair font-semibold text-xl mb-1">{collection.name}</h3>
                  <p className="text-deep-indigo/70 text-sm mb-3">{collection.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-deep-indigo font-medium">From {collection.startingPrice}</span>
                    <Button variant="outline" size="sm" className="text-deep-indigo border-deep-indigo/20 hover:bg-deep-indigo hover:text-white">
                      View in 3D
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-6 md:hidden">
          <div className="flex space-x-3">
            <button 
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-deep-indigo/20 flex items-center justify-center hover:bg-deep-indigo hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ArrowLeft size={18} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-deep-indigo/20 flex items-center justify-center hover:bg-deep-indigo hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCollections;
