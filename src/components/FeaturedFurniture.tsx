import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { FurnitureCatalogItem } from "@/types/furniture";
import { fetchAllDocuments } from "@/../fbcodes"; // Adjust the path as needed

const FeaturedFurniture = () => {
  const [furnitureItems, setFurnitureItems] = useState<FurnitureCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { addToCart } = useCart();

  // Fetch furniture items
  useEffect(() => {
    const loadFurniture = async () => {
      setIsLoading(true);
      try {
        const allFurniture = await fetchAllDocuments("f_catalog");

        // Convert the documents to match our FurnitureCatalogItem interface
        const formattedFurniture = allFurniture.map((doc) => ({
          id: doc.id,
          name: doc.name || "",
          ctg: doc.ctg || "",
          price: doc.price || 0,
          color: doc.color || "",
          material: doc.material || "",
          picture: doc.picture || "/placeholder.svg",
          m_code: doc.m_code || "",
          // model is a URL in Firestore, not needed for this view
        }));

        setFurnitureItems(formattedFurniture);
        console.log("Fetched furniture items:", formattedFurniture);
      } catch (error) {
        console.error("Error fetching furniture items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFurniture();
  }, []);

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

  const handleAddToCart = (item: FurnitureCatalogItem) => {
    // Adapt the FurnitureCatalogItem to match what the cart expects
    const cartItem = {
      id: item.id,
      name: item.name,
      description: `${item.color} ${item.material}`, // Create a description from color and material
      price: item.price,
      image: item.picture,
      category: item.ctg,
      quantity: 1,
    };

    addToCart(cartItem);
  };

  return (
    <div id="collections" className="py-20 bg-deep-indigo/5">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-10 px-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold mb-2">
              Featured Furniture
            </h2>
            <p className="text-deep-indigo/80">Curated selection of our finest furniture</p>
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-deep-indigo" />
              <p className="mt-4 text-deep-indigo/70">Loading furniture collection...</p>
            </div>
          </div>
        ) : (
          <>
            {furnitureItems.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-deep-indigo/70">No furniture items found.</p>
              </div>
            ) : (
              <div
                className="flex overflow-x-auto scrollbar-hide snap-x pb-6 px-4"
                ref={scrollContainerRef}
                style={{ scrollBehavior: "smooth" }}
              >
                {furnitureItems.map((item) => (
                  <div
                    key={item.id}
                    className="min-w-[280px] md:min-w-[350px] snap-start mr-6 perspective-card"
                  >
                    <div className="bg-white rounded-lg overflow-hidden shadow-md h-full">
                      <div className="h-48 md:h-64 relative overflow-hidden">
                        <img
                          src={item.picture}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                          onError={(e) => {
                            // Fallback for broken images
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-playfair font-semibold text-xl mb-1">{item.name}</h3>
                        <p className="text-deep-indigo/70 text-sm mb-3">
                          {item.color} {item.material} - {item.m_code}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-deep-indigo font-medium">
                            LKR {item.price.toFixed(2)}
                          </span>
                          <Button
                            onClick={() => handleAddToCart(item)}
                            className="text-white border-deep-indigo/20 hover:bg-black hover:text-white"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && furnitureItems.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default FeaturedFurniture;
