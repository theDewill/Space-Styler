import React, { useState, useEffect } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { FurnitureItem, FurnitureCategory } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Upload,
  AlertTriangle,
  PlusCircle,
  File,
  Link,
  RefreshCw,
  Loader2,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import ModelUploader from "./ModelUploader";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  isFirebaseStorageUrl,
  getDirectDownloadUrl,
  isValidModelUrl,
  extractNameFromUrl,
} from "@/utils/shapeUtils";
import { mockModels, MockModel } from "@/data/mockModels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllDocuments, fetchAndUse3DModel } from "../../../fbcodes"; // Make sure path is correct

const categories = [
  { id: "all", label: "All Models" },
  { id: "furniture", label: "Furniture" },
  { id: "decoration", label: "Decor" },
  { id: "structure", label: "Structure" },
];

// Helper function to validate OBJ URLs - now using the updated utility function
const isValidModelUrlWrapper = (url: string): boolean => {
  return isValidModelUrl(url);
};

// Define interface for catalog items from Firestore
interface CatalogItem {
  id: string;
  m_code: string;
  name: string;
  url: string;
  thumbnail?: string;
  category: FurnitureCategory;
  model: string; // URL to the model file
  // Add other fields your collection might have
}

const FurnitureCatalog: React.FC = () => {
  const { customModels, addFurniture, currentProject, removeCustomModel, addCustomModel } =
    useProject();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showUploader, setShowUploader] = useState(false);
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [modelUrl, setModelUrl] = useState("");
  const [modelName, setModelName] = useState("");
  const [modelCategory, setModelCategory] = useState<FurnitureCategory>("furniture");
  const [isImporting, setIsImporting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [selectedModelCode, setSelectedModelCode] = useState<string>("");
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [loadingModelId, setLoadingModelId] = useState<string | null>(null);
  const [isAddingFurniture, setIsAddingFurniture] = useState(false);

  const handleDragStart = (e: React.DragEvent, furniture: FurnitureItem) => {
    // Create a copy with a new unique ID to prevent conflicts
    const furnitureCopy = {
      ...furniture,
      id: `${furniture.id.split("-")[0]}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    e.dataTransfer.setData("furniture", JSON.stringify(furnitureCopy));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDoubleClick = (furniture: FurnitureItem) => {
    if (!currentProject || isAddingFurniture) return;

    // Set flag to prevent multiple rapid additions
    setIsAddingFurniture(true);

    const newFurniture = {
      ...furniture,
      id: `${furniture.id.split("-")[0]}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      position: {
        x: currentProject.room.dimensions.width / 2,
        y: 0,
        z: currentProject.room.dimensions.length / 2,
      },
    };

    // Add furniture with a slight delay to ensure the renderer is ready
    setTimeout(() => {
      addFurniture(newFurniture);
      toast("Model added to your room");

      // Reset the flag after a short delay
      setTimeout(() => {
        setIsAddingFurniture(false);
      }, 500);
    }, 100);
  };

  const handleDeleteCustomModel = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this model?")) {
      removeCustomModel(modelId);
      toast("3D model removed from catalog");
    }
  };

  // Filter models based on search and category
  let filteredModels: FurnitureItem[] = customModels.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleUploader = () => {
    setShowUploader(!showUploader);
    if (showUrlImport) setShowUrlImport(false);
  };

  const toggleUrlImport = () => {
    setShowUrlImport(!showUrlImport);
    if (showUploader) setShowUploader(false);

    // Reset form and errors when opening
    if (!showUrlImport) {
      setModelUrl("");
      setModelName("");
      setUrlError(null);
    }
  };

  // Enhanced URL validation with more helpful error messages
  const validateUrlInput = (): boolean => {
    if (!modelUrl.trim()) {
      setUrlError("Please enter a URL");
      return false;
    }

    if (!isValidModelUrlWrapper(modelUrl)) {
      setUrlError(
        "URL must point to an OBJ file or supported storage service (Firebase, Google Drive, etc.)",
      );
      return false;
    }

    setUrlError(null);
    return true;
  };

  // Fetch catalog items on component mount
  useEffect(() => {
    fetchCatalogItems();
  }, []);

  // Function to fetch catalog items from Firestore
  const fetchCatalogItems = async () => {
    setIsLoadingCatalog(true);
    try {
      const items = await fetchAllDocuments("f_catalog");
      setCatalogItems(items as CatalogItem[]);
    } catch (error) {
      console.error("Error fetching catalog items:", error);
      toast("Failed to load model catalog", {
        description: "Please try refreshing the page.",
      });
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  // Handler for model code selection from Firestore catalog
  const handleModelCodeSelect = async (code: string) => {
    if (isAddingFurniture) return;
    const selectedModel = catalogItems.find((model) => model.m_code === code);

    if (!selectedModel) return;

    setSelectedModelCode(code);
    setIsAddingFurniture(true);
    // Set loading state for this specific model
    setLoadingModelId(code);

    try {
      toast("Loading 3D model...", {
        description: "Please wait while the model is prepared.",
      });

      const modelObj = await fetchAndUse3DModel(selectedModel.model);

      if (!modelObj) {
        toast("Failed to load model", {
          description: "Could not retrieve the 3D model from storage",
        });
        return;
      }

      // Create a furniture item from the catalog model
      const newFurnitureItem: FurnitureItem = {
        id: `${selectedModel.m_code.toLowerCase()}-${Date.now()}`,
        name: selectedModel.name,
        model: modelObj || "",
        category: selectedModel.category || "furniture",
        thumbnail: selectedModel.thumbnail || "",
        material: {
          id: `material-${Date.now()}`,
          name: "Default",
          color: "#cccccc",
        },
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        dimensions: {
          width: 1,
          height: 1,
          length: 1,
        },
      };

      // Add to custom models
      // Add to custom models with a slight delay
      setTimeout(() => {
        addCustomModel(newFurnitureItem);
        toast(`Model "${selectedModel.name}" (${selectedModel.m_code}) loaded to catalog`);

        // Reset the flag after a short delay
        setTimeout(() => {
          setIsAddingFurniture(false);
        }, 500);
      }, 100);
    } catch (error) {
      console.error("Error loading model:", error);
      toast("Failed to load model", {
        description: "An error occurred while processing the model",
      });
    } finally {
      // Clear loading state
      setLoadingModelId(null);
    }
  };

  // Enhanced URL model import function with improved error handling
  const handleUrlImport = async () => {
    // Validate URL
    if (!validateUrlInput()) {
      return;
    }

    // Auto-generate name from URL if field is empty
    const finalName = modelName.trim() || extractNameFromUrl(modelUrl) || "Imported model";

    setIsImporting(true);

    try {
      toast("Importing 3D model...", {
        description: "This may take a moment.",
      });

      // Create a unique ID for the model
      const uniqueId = `url-model-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Process the URL to get direct download link
      const processedUrl = getDirectDownloadUrl(modelUrl);

      console.log(`Processed URL for model "${finalName}":`, processedUrl);

      // Create a model item using the processed direct URL
      const newModel: FurnitureItem = {
        id: uniqueId,
        name: finalName,
        category: modelCategory,
        model: processedUrl, // Use the processed URL directly
        thumbnail: "", // Empty for URL imports
        material: {
          id: `material-${Date.now()}`,
          name: "Default",
          color: "#cccccc",
        },
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        dimensions: {
          width: 1,
          height: 1,
          length: 1,
        },
      };

      // Add the model to the catalog
      addCustomModel(newModel);

      // Reset form and close it
      setModelUrl("");
      setModelName("");
      setModelCategory("furniture");
      setShowUrlImport(false);

      toast("3D model added to catalog", {
        description: `"${finalName}" was successfully added from URL`,
      });
    } catch (error) {
      console.error("Error importing model from URL:", error);
      toast("Failed to import model", {
        description: "Please ensure the URL points to a valid OBJ file and is publicly accessible.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex flex-col justify-between items-center gap-4">
          <div>
            <CardTitle className="text-lg">3D Model Catalog</CardTitle>
            <CardDescription>Drag or double-click to add models to your room</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleUrlImport}
              className="flex items-center gap-1"
            >
              <Link className="h-4 w-4" />
              URL Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleUploader}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Upload Model
            </Button>
          </div>
        </div>

        {/* Model Code Selection Dropdown - Updated to use Firestore data */}
        <div className="mt-3">
          <Label htmlFor="model-code" className="text-xs mb-1 block">
            Select Model by Code
          </Label>
          <Select
            value={selectedModelCode}
            onValueChange={handleModelCodeSelect}
            disabled={isLoadingCatalog || loadingModelId !== null}
          >
            <SelectTrigger className="w-full">
              {isLoadingCatalog ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading models...
                </div>
              ) : loadingModelId !== null ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading model...
                </div>
              ) : (
                <SelectValue placeholder="Select model code" />
              )}
            </SelectTrigger>
            <SelectContent>
              {catalogItems.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">
                  {isLoadingCatalog ? "Loading catalog..." : "No models found in catalog"}
                </div>
              ) : (
                catalogItems.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.m_code}
                    disabled={loadingModelId === model.m_code}
                  >
                    {model.m_code === loadingModelId ? (
                      <div className="flex items-center">
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      `${model.m_code} - ${model.name}`
                    )}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Select a model code to quickly load pre-defined 3D models
          </p>

          {/* Add a refresh button to reload catalog */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCatalogItems}
            disabled={isLoadingCatalog || loadingModelId !== null}
            className="mt-1"
          >
            {isLoadingCatalog ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Refresh Catalog
          </Button>

          {/* Loading indicator for the model being fetched */}
          {loadingModelId && (
            <div className="mt-2 flex items-center justify-center bg-muted/20 rounded-md p-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">Preparing model...</span>
              </div>
            </div>
          )}
        </div>

        {/* URL Import Form with improved validation feedback */}
        {showUrlImport && (
          <div className="mt-2 p-2 bg-muted/20 rounded-md space-y-2">
            <div>
              <Label htmlFor="model-url" className="text-xs mb-1 block">
                Model URL (OBJ format)
              </Label>
              <Input
                id="model-url"
                placeholder="https://example.com/model.obj or Firebase/Google Drive link"
                value={modelUrl}
                onChange={(e) => {
                  setModelUrl(e.target.value);
                  // Clear error when typing
                  if (urlError) setUrlError(null);
                  // Try to extract name from URL if name field is empty
                  if (!modelName && extractNameFromUrl(e.target.value)) {
                    setModelName(extractNameFromUrl(e.target.value));
                  }
                }}
                className={`mb-1 ${urlError ? "border-red-500" : ""}`}
              />
              {urlError && <p className="text-red-500 text-xs">{urlError}</p>}
              <p className="text-xs text-muted-foreground mb-2">
                Supported sources: Direct OBJ links, Firebase Storage, Google Drive
              </p>
            </div>
            <div>
              <Label htmlFor="model-name" className="text-xs mb-1 block">
                Model Name
              </Label>
              <Input
                id="model-name"
                placeholder="Chair, Table, etc."
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="mb-2"
              />
            </div>
            <div>
              <Label htmlFor="model-category" className="text-xs mb-1 block">
                Category
              </Label>
              <select
                id="model-category"
                value={modelCategory}
                onChange={(e) => setModelCategory(e.target.value as FurnitureCategory)}
                className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="furniture">Furniture</option>
                <option value="decoration">Decoration</option>
                <option value="structure">Structure</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowUrlImport(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUrlImport}
                disabled={isImporting}
                className="flex items-center gap-1"
              >
                {isImporting ? (
                  <>
                    <Upload className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {showUploader && (
          <div className="mt-2 p-2 bg-muted/20 rounded-md">
            <ModelUploader
              onComplete={() => {
                setShowUploader(false);
                setActiveCategory("all");
              }}
            />
          </div>
        )}
      </CardHeader>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search models..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <div className="border-b px-4">
          <TabsList className="w-full justify-start overflow-auto py-1 h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs py-1.5">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <CardContent className="p-0 flex-1 overflow-y-auto">
          <TabsContent value={activeCategory} forceMount={true} className="mt-0 p-0">
            <div className="grid grid-cols-2 gap-2 p-4">
              {filteredModels.length > 0 ? (
                filteredModels.map((item) => (
                  <div
                    key={item.id}
                    className="furniture-item bg-white p-2 border rounded cursor-grab hover:shadow-md transition-shadow relative"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDoubleClick={() => handleDoubleClick(item)}
                  >
                    <div className="aspect-square bg-muted/30 rounded-sm mb-2 flex items-center justify-center">
                      <File className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-xs truncate font-medium">{item.name}</div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteCustomModel(e, item.id)}
                      className="absolute top-1 right-1 p-1 bg-red-100 rounded-full hover:bg-red-200 text-red-600"
                      title="Delete model"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-muted-foreground">
                  No 3D models found. Upload your first .obj model with the "Upload Model" button.
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default FurnitureCatalog;
