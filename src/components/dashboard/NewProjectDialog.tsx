import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { fetchAllDocuments } from "../../../fbcodes";
import { Upload, Loader2 } from "lucide-react";
import { importSceneFromJSON } from "@/utils/exportUtils";

// Add interface for design data
interface DesignData {
  id: string;
  name: string;
  projectData: any;
  createdAt: any;
  createdBy: string;
}

const NewProjectDialog: React.FC = () => {
  const [name, setName] = useState("");
  const [width, setWidth] = useState(5);
  const [length, setLength] = useState(4);
  const [height, setHeight] = useState(2.5);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Add new state variables for import functionality
  const [designsDialogOpen, setDesignsDialogOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<DesignData[]>([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createNewProject, importScene } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      createNewProject(name, { width, length, height });

      // Show success toast
      toast({
        title: "Project created",
        description: `${name} has been created successfully.`,
      });

      setOpen(false);

      // Small timeout to ensure state is updated before navigation
      setTimeout(() => {
        navigate("/project/editor");
      }, 100);
    } catch (error) {
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
      console.error("Project creation error:", error);
    } finally {
      setIsCreating(false);
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
      toast({
        title: "Failed to load designs",
        description: "There was an error loading your saved designs.",
        variant: "destructive",
      });
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
        // Set the form name to the design name
        setName(design.name);

        // Use room dimensions from the design if available
        if (design.projectData.roomDimensions) {
          setWidth(design.projectData.roomDimensions.width || width);
          setLength(design.projectData.roomDimensions.length || length);
          setHeight(design.projectData.roomDimensions.height || height);
        }

        setDesignsDialogOpen(false);

        toast({
          title: "Design loaded",
          description: `${design.name} has been loaded. Click Create Project to continue.`,
        });
      } else {
        toast({
          title: "Invalid design data",
          description: "This design cannot be loaded.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading design:", error);
      toast({
        title: "Failed to load design",
        description: "There was an error loading the design.",
        variant: "destructive",
      });
    }
  };

  // Handle file import for scene JSON
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Check if it's a JSON file
    if (!file.name.toLowerCase().endsWith(".json")) {
      toast({
        title: "Import failed",
        description: "Please select a valid JSON scene file.",
        variant: "destructive",
      });
      return;
    }

    // Read the file and extract project data
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        // Set project name from the file
        if (jsonData.name) {
          setName(jsonData.name);
        }

        // Set dimensions if available
        if (jsonData.scene && jsonData.scene.roomDimensions) {
          const { width: w, length: l, height: h } = jsonData.scene.roomDimensions;
          if (w) setWidth(w);
          if (l) setLength(l);
          if (h) setHeight(h);
        }

        toast({
          title: "Design loaded from file",
          description: "Design data has been loaded. Click Create Project to continue.",
        });
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        toast({
          title: "Import failed",
          description: "The selected file contains invalid data.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);

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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>New Project</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up the basic information for your new room design project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Living Room Design"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Room Width: {width}m</Label>
                <Slider
                  value={[width]}
                  min={2}
                  max={15}
                  step={0.1}
                  onValueChange={(value) => setWidth(value[0])}
                />
              </div>
              <div className="grid gap-2">
                <Label>Room Length: {length}m</Label>
                <Slider
                  value={[length]}
                  min={2}
                  max={15}
                  step={0.1}
                  onValueChange={(value) => setLength(value[0])}
                />
              </div>
              <div className="grid gap-2">
                <Label>Ceiling Height: {height}m</Label>
                <Slider
                  value={[height]}
                  min={2}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => setHeight(value[0])}
                />
              </div>

              {/* Import options */}
              {/* <div className="flex justify-between items-center mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenDesignsDialog}
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Import Design
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Import from File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div> */}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Saved Designs */}
      {/* <Dialog open={designsDialogOpen} onOpenChange={setDesignsDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Saved Design</DialogTitle>
            <DialogDescription>
              Select a saved design to use as a starting point for your new project.
            </DialogDescription>
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
                <p className="text-sm mt-1">You can save designs using the 'Save to Cloud' button in the editor.</p>
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
                      {design.createdAt ? new Date(design.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setDesignsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </>
  );
};

export default NewProjectDialog;
