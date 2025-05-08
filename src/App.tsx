import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Catalog from "./pages/Catalog";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/authContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardPage from "./components/dashboard/DashboardPage";
import EditorPage from "./components/editor/EditorPage";
import { ProjectProvider } from "./contexts/ProjectContext";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartProvider>
          <BrowserRouter>
            <AuthProvider>
              <ProjectProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<Cart />} />
                  </Route>

                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                  </Route>

                  <Route element={<ProtectedRoute />}>
                    <Route path="/project/editor" element={<EditorPage />} />
                  </Route>

                  <Route element={<ProtectedRoute />}>
                    <Route path="/project/:id" element={<EditorPage />} />
                  </Route>

                  <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>

                  <Route element={<ProtectedRoute />}>
                    <Route path="/catalog" element={<Catalog />} />
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProjectProvider>
            </AuthProvider>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
