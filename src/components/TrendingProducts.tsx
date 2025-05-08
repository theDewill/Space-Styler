import { useState, useEffect } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { FurnitureCatalogItem } from "@/types/furniture";
import { fetchAllDocuments } from "@/../fbcodes"; // Adjust the path as needed

const TrendingProducts = () => {
  const [products, setProducts] = useState<FurnitureCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // Fetch trending products
  useEffect(() => {
    const loadTrendingProducts = async () => {
      setIsLoading(true);
      try {
        const trendingProducts = await fetchAllDocuments("f_catalog_trending");

        // Convert the documents to match our FurnitureCatalogItem interface
        const formattedProducts = trendingProducts.map((doc) => ({
          id: doc.id,
          name: doc.name || "",
          ctg: doc.ctg || "",
          price: doc.price || 0,
          color: doc.color || "",
          material: doc.material || "",
          picture: doc.picture || "/placeholder.svg",
          m_code: doc.m_code || "",
          // Additional properties for display
          size: doc.size || "medium", // Default to medium if not specified
        }));

        setProducts(formattedProducts);
        console.log("Fetched trending products:", formattedProducts);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingProducts();
  }, []);

  const handleAddToCart = (product: FurnitureCatalogItem) => {
    // Adapt the FurnitureCatalogItem to match what the cart expects
    const cartItem = {
      id: product.id,
      name: product.name,
      description: `${product.color} ${product.material}`,
      price: product.price,
      image: product.picture,
      category: product.ctg,
      quantity: 1,
    };

    addToCart(cartItem);
  };

  return (
    <div id="inspiration" className="py-20 container mx-auto">
      <div className="text-center mb-16 px-4">
        <h2 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">
          Currently <span className="relative animated-underline">Trending</span>
        </h2>
        <p className="text-lg text-deep-indigo/80 max-w-2xl mx-auto">
          Discover our most popular pieces, loved by design enthusiasts worldwide.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-deep-indigo" />
            <p className="mt-4 text-deep-indigo/70">Loading trending products...</p>
          </div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-deep-indigo/70">No trending products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "rounded-lg overflow-hidden shadow-md perspective-card",
                    product.size === "large" && "sm:col-span-2 sm:row-span-2",
                    product.size === "medium" && "sm:col-span-2 lg:col-span-1",
                  )}
                >
                  <div
                    className={cn(
                      "relative overflow-hidden",
                      product.size === "large" ? "h-80" : "h-64",
                    )}
                  >
                    <img
                      src={product.picture}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      onError={(e) => {
                        // Fallback for broken images
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-playfair font-medium text-lg">{product.name}</h3>
                      <span className="font-medium">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-deep-indigo/70 text-sm">
                      {product.color} {product.material} - {product.m_code}
                    </p>
                    <div className="mt-3">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full flex justify-center items-center"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-10 text-center">
              <button className="font-medium text-deep-indigo hover:text-accent-gold transition-colors inline-flex items-center">
                Load More Products
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrendingProducts;
