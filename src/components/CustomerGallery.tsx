import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const galleryItems = [
  {
    id: "gallery_1",
    image:
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80",
    customer: "Sarah L.",
    roomType: "Living Room",
    items: 7,
    likes: 124,
  },
  {
    id: "gallery_2",
    image:
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJlZHJvb218ZW58MHx8MHx8fDA%3D",
    customer: "James K.",
    roomType: "Bedroom",
    items: 5,
    likes: 98,
  },
  {
    id: "gallery_3",
    image:
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
    customer: "Elena M.",
    roomType: "Living Room",
    items: 4,
    likes: 86,
  },
  {
    id: "gallery_4",
    image:
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80",
    customer: "Shenaya W.",
    roomType: "Kitchen",
    items: 6,
    likes: 115,
  },
  {
    id: "gallery_5",
    image:
      "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?auto=format&fit=crop&w=800&q=80",
    customer: "Michelle T.",
    roomType: "Living Room",
    items: 8,
    likes: 152,
  },
  {
    id: "gallery_6",
    image:
      "https://images.unsplash.com/photo-1599327286062-40b0a7f2b305?auto=format&fit=crop&w=800&q=80",
    customer: "Kasun H.",
    roomType: "Dine area",
    items: 4,
    likes: 74,
  },
];

const CustomerGallery = () => {
  return (
    <div id="gallery" className="py-20 bg-deep-indigo/5">
      <div className="container mx-auto">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">
            Spaces Designed by Us
          </h2>
          <p className="text-lg text-deep-indigo/80 max-w-2xl mx-auto">
            Real spaces brought to life with our 3D visualization tool.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="rounded-lg overflow-hidden perspective-card group">
              <div className="relative h-72">
                <img
                  src={item.image}
                  alt={`${item.customer}'s ${item.roomType}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <Button
                    variant="ghost"
                    className="bg-white/90 hover:bg-white w-full text-deep-indigo mb-4"
                  >
                    Recreate This Room
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-playfair font-medium">
                    {item.customer}'s {item.roomType}
                  </span>
                </div>
                <p className="text-deep-indigo/70 text-sm">{item.items} items</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerGallery;
