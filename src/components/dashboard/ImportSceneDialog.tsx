import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/contexts/ProjectContext";
import { importSceneFromJSON } from "@/utils/exportUtils";
import { toast } from "sonner";
import { Import, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchAllDocuments } from "../../../fbcodes";

// Interface for design data
interface DesignData {
  id: string;
  name: string;
  projectData: any;
  createdAt: any;
  createdBy: string;
}

const ImportSceneDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { importScene } = useProject();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<DesignData[]>([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  const navigate = useNavigate();

  // Fetch designs when dialog opens and tab changes to cloud
  useEffect(() => {
    if (open && activeTab === "cloud") {
      fetchSavedDesigns();
    }
  }, [open, activeTab]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast("Please select a file to import", {
        description: "You need to select a JSON scene file.",
      });
      return;
    }

    setIsImporting(true);

    // Use the importSceneFromJSON utility
    importSceneFromJSON(selectedFile, (projectData) => {
      try {
        importScene(projectData);
        setOpen(false);
        toast("Scene imported successfully", {
          description: "Your scene has been imported and is ready to edit.",
        });

        // Navigate to editor page after successful import
        setTimeout(() => {
          navigate("/project/editor");
        }, 300);
      } catch (error) {
        console.error("Error during import:", error);
        toast("Import failed", {
          description: "There was an error importing your scene. Please try again.",
        });
      } finally {
        setIsImporting(false);
      }
    });
  };

  const handleLoadDesign = (design: DesignData) => {
    try {
      setIsImporting(true);

      if (design.projectData) {
        importScene(design.projectData);
        setOpen(false);
        toast("Design loaded successfully", {
          description: `Loaded: ${design.name}`,
        });

        // Navigate to editor page after successful import
        setTimeout(() => {
          navigate("/project/editor");
        }, 300);
      } else {
        toast("Invalid design data");
      }
    } catch (error) {
      console.error("Error loading design:", error);
      toast("Failed to load design");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Import className="h-4 w-4" />
          Import Scene
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Import Scene</DialogTitle>
          <DialogDescription>
            Import a previously saved design or a scene JSON file.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">From File</TabsTrigger>
            <TabsTrigger value="cloud">From Cloud</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="scene-file" className="text-sm font-medium">
                  Scene File
                </label>
                <Input id="scene-file" type="file" accept=".json" onChange={handleFileChange} />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleImport} disabled={!selectedFile || isImporting}>
                  {isImporting ? "Importing..." : "Import"}
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="py-4">
            <div className="max-h-[400px] overflow-y-auto">
              {isLoadingDesigns ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading designs...</span>
                </div>
              ) : savedDesigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No saved designs found.</p>
                  <p className="text-sm mt-1">
                    You can save designs using the 'Save to Cloud' button in the editor.
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

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => fetchSavedDesigns()}
                disabled={isLoadingDesigns}
                variant="outline"
              >
                Refresh
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSceneDialog;
