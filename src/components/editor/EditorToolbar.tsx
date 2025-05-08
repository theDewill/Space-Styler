import React, { useState, useRef, useEffect } from "react"; // Add useEffect
import { Button } from "@/components/ui/button";
import {
  Save,
  Undo,
  Redo,
  Eye,
  Grid3X3,
  Ruler,
  Maximize2,
  Download,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  Import,
  Upload,
} from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportTo2D,
  exportTo3D,
  exportSceneToJSON,
  importSceneFromJSON,
} from "@/utils/exportUtils";
import { addDocument, fetchAllDocuments } from "../../../fbcodes"; // Add this import if not already there
import { Loader2 } from "lucide-react"; // Add this import for loading spinner

interface ExportFormValues {
  designName: string;
}

// Add interface for design data
interface DesignData {
  id: string;
  name: string;
  projectData: any;
  createdAt: any;
  createdBy: string;
}

const EditorToolbar = () => {
  const { currentProject, saveProject, view, setView, setTransformMode, importScene } =
    useProject();
  const [isSaving, setIsSaving] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [designsDialogOpen, setDesignsDialogOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<DesignData[]>([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ExportFormValues>({
    defaultValues: {
      designName: currentProject?.name || "My Design",
    },
  });

  const handleSave = async () => {
    if (!currentProject) {
      toast("No project to save");
      return;
    }

    setIsSaving(true);

    try {
      saveProject();
      toast("Project saved successfully");
    } catch (error) {
      console.error("Error saving project:", error);
      toast("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleViewMode = () => {
    setView({ mode: view.mode === "2d" ? "3d" : "2d" });
  };

  const toggleGrid = () => {
    setView({ showGrid: !view.showGrid });
  };

  const toggleDimensions = () => {
    setView({ showDimensions: !view.showDimensions });
  };

  const handleExport = () => {
    if (!currentProject) {
      toast("No project to export");
      return;
    }

    if (view.mode === "2d") {
      exportTo2D(currentProject);
    } else {
      exportTo3D(currentProject);
    }
  };

  // Handle scene export with custom name
  const handleExportSubmit = async (values: ExportFormValues) => {
    if (!currentProject) {
      toast("No project to export");
      return;
    }

    // Export to JSON file (download)
    exportSceneToJSON(currentProject, values.designName);

    // Also save to Firebase
    try {
      // Create design data for Firebase
      const designData = {
        name: values.designName,
        projectData: currentProject,
        createdBy: "currentUserId", // Replace with actual user ID when you have auth
        timestamp: new Date(),
      };

      // Save to Firebase collection
      const designId = await addDocument("f_design", designData);

      toast("Design saved to cloud", {
        description: `Design "${values.designName}" saved to cloud and downloaded`,
      });
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      toast("Downloaded locally but failed to save to cloud");
    }

    setExportDialogOpen(false);
  };

  // Handle file import for scene JSON
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Check if it's a JSON file
    if (!file.name.toLowerCase().endsWith(".json")) {
      toast("Import failed", {
        description: "Please select a valid JSON scene file.",
      });
      return;
    }

    // Import the scene
    importSceneFromJSON(file, importScene);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add a new function to handle saving to cloud only
  const handleSaveToCloud = async () => {
    if (!currentProject) {
      toast("No project to save");
      return;
    }

    try {
      const designName = form.getValues("designName");

      // Create design data for Firebase
      const designData = {
        name: designName,
        projectData: currentProject,
        createdBy: "currentUserId", // Replace with actual user ID when you have auth
        timestamp: new Date(),
      };

      // Save to Firebase collection
      const designId = await addDocument("f_design", designData);

      toast("Design saved to cloud", {
        description: `Design "${designName}" saved successfully.`,
      });

      setExportDialogOpen(false);
    } catch (error) {
      console.error("Error saving to cloud:", error);
      toast("Failed to save design to cloud");
    }
  };

  // Function to fetch all designs
  const fetchSavedDesigns = async () => {
    setIsLoadingDesigns(true);
    try {
      const designs = await fetchAllDocuments("f_design");
      setSavedDesigns(designs as DesignData[]);
    } catch (error) {
      console.error("Error fetching designs:", error);
      toast("Failed to load saved designs");
    } finally {
      setIsLoadingDesigns(false);
    }
  };

  // Function to handle opening designs dialog
  const handleOpenDesignsDialog = () => {
    setDesignsDialogOpen(true);
    fetchSavedDesigns();
  };

  // Function to load a selected design
  const handleLoadDesign = (design: DesignData) => {
    try {
      if (design.projectData) {
        importScene(design.projectData);
        toast("Design loaded successfully", {
          description: `Loaded: ${design.name}`,
        });
        setDesignsDialogOpen(false);
      } else {
        toast("Invalid design data");
      }
    } catch (error) {
      console.error("Error loading design:", error);
      toast("Failed to load design");
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b bg-background">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          Browser Save
        </Button>

        <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
          <Undo className="h-4 w-4" />
          Undo
        </Button>

        <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
          <Redo className="h-4 w-4" />
          Redo
        </Button>

        <div className="h-6 border-l mx-1" />

        <Button
          variant={view.mode === "2d" ? "secondary" : "outline"}
          size="sm"
          onClick={toggleViewMode}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          {view.mode === "2d" ? "2D View" : "3D View"}
        </Button>

        <Button
          variant={view.showGrid ? "secondary" : "outline"}
          size="sm"
          onClick={toggleGrid}
          className="flex items-center gap-1"
        >
          <Grid3X3 className="h-4 w-4" />
          Grid
        </Button>

        <Button
          variant={view.showDimensions ? "secondary" : "outline"}
          size="sm"
          onClick={toggleDimensions}
          className="flex items-center gap-1"
        >
          <Ruler className="h-4 w-4" />
          Dimensions
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Transform tools - only show in 3D mode */}
        {view.mode === "3d" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {view.transformMode === "translate" && "Move"}
                {view.transformMode === "rotate" && "Rotate"}
                {view.transformMode === "scale" && "Scale"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Transform Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTransformMode("translate")}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransformMode("rotate")}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Rotate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransformMode("scale")}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Scale
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTransformMode("translate")}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Move Up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransformMode("translate")}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Move Down
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Export {view.mode.toUpperCase()}
        </Button>

        {/* Button for exporting scene as JSON with dialog */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExportDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Save / Download Scene
        </Button>

        {/* New button for importing scene JSON done */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenDesignsDialog}
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4" />
          Import Scene
        </Button>

        {/* Keep the hidden file input for manual file uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>

      {/* Dialog for entering design name when exporting */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Design</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleExportSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="designName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Design Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a name for your design" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-between sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleSaveToCloud}>
                    <Save className="h-4 w-4 mr-2" />
                    Save to Cloud
                  </Button>
                  <Button type="submit">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New Dialog for Saved Designs */}
      <Dialog open={designsDialogOpen} onOpenChange={setDesignsDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Saved Design</DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingDesigns ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading designs...</span>
              </div>
            ) : savedDesigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No saved designs found.</p>
                <p className="text-sm mt-1">
                  You can save designs using the 'Save to Cloud' button.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {savedDesigns.map((design) => (
                  <div
                    key={design.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleLoadDesign(design)}
                  >
                    <h3 className="font-medium">{design.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {design.createdAt
                        ? new Date(design.createdAt.seconds * 1000).toLocaleDateString()
                        : "Unknown date"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={triggerFileInput}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4 mr-1" />
              Import from File
            </Button>
            <Button onClick={() => setDesignsDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditorToolbar;
