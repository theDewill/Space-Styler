import { ArrowLeft, Monitor, Sofa } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

function getGreeting(): string {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

const Admin = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto py-24 flex-grow">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-muted-foreground hover:text-foreground"
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <h1 className="text-3xl font-playfair font-semibold mb-8">Hello, {getGreeting()} !</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Button
            variant="outline"
            className="h-48 flex flex-col items-center justify-center gap-4 border-2 hover:border-accent-gold hover:text-white transition-all"
            onClick={() => handleNavigate("/dashboard")}
          >
            <Monitor className="h-12 w-12" />
            <span className="text-xl font-playfair">3D Visualizer</span>
          </Button>

          <Button
            variant="outline"
            className="h-48 flex flex-col items-center justify-center gap-4 border-2 hover:border-accent-gold hover:text-white transition-all"
            onClick={() => handleNavigate("/catalog")}
          >
            <Sofa className="h-12 w-12" />
            <span className="text-xl font-playfair">Catalog Manager</span>
          </Button>
        </div>

        {/* Added extra space to push footer down */}
        <div className="mt-60"></div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
