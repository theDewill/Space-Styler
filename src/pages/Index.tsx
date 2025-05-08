import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import Hero from "@/components/Hero";
import VisualizerShowcase from "@/components/VisualizerShowcase";
import FeaturedFurniture from "@/components/FeaturedFurniture";
import TrendingProducts from "@/components/TrendingProducts";
import CustomerGallery from "@/components/CustomerGallery";
import Footer from "@/components/Footer";
import { useAppTheme } from "../contexts/ThemeContext";

const Index = () => {
  const { setAppTheme } = useAppTheme();

  useEffect(() => {
    // Set the furniture theme when this component mounts
    setAppTheme("law");

    // Optional: Add debug information
    console.log("FurnitureApp mounted, theme set to furniture");
  }, [setAppTheme]);
  return (
    <div className="bg-warm-cream min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedFurniture />
      <VisualizerShowcase />
      <TrendingProducts />
      <CustomerGallery />
      <Footer />
    </div>
  );
};

export default Index;
