import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/ProjectContext";
import { FurnitureCategory } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ModelUploaderProps {
  onComplete?: () => void;
}

const ModelUploader: React.FC<ModelUploaderProps> = ({ onComplete }) => {
  const { addCustomModel } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState("");
  const [modelCategory, setModelCategory] = useState<FurnitureCategory>("decoration");
  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
    length: 1,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if the file is an .obj file
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension !== "obj") {
        toast.error("Invalid file format", {
          description: "Please select only .obj 3D model files.",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setModelFile(file);
      setPreviewError(null);

      // Set a default name based on the file name if no name is provided
      if (!modelName) {
        setModelName(file.name.split(".")[0].replace(/[_-]/g, " "));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!modelFile) {
      toast.error("Please select an .obj model file");
      return;
    }

    if (!modelName.trim()) {
      toast.error("Please enter a name for your model");
      return;
    }

    setIsUploading(true);

    // Generate a unique ID for the model
    const uniqueId = `file-model-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create a blob URL for the model file with the unique ID
    const modelUrl = URL.createObjectURL(new Blob([modelFile], { type: "model/obj" }));

    console.log("Creating model with URL:", modelUrl);

    const newModel = {
      id: uniqueId,
      name: modelName,
      category: modelCategory,
      model: modelUrl,
      thumbnail: "/placeholder.svg",
      dimensions: dimensions,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      material: { id: "default", name: "Default", color: "#cccccc" },
    };

    // Add a slight delay to give time for the blob URL to be ready
    setTimeout(() => {
      addCustomModel(newModel);

      toast.success("3D model added", {
        description:
          "Your .obj model has been added to the catalog. Drag and drop it into the room.",
      });

      setModelFile(null);
      setModelName("");
      setDimensions({ width: 1, height: 1, length: 1 });
      setPreviewError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setIsUploading(false);

      if (onComplete) {
        onComplete();
      }
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="model-file">OBJ Model File</Label>
        <div className="mt-1 flex items-center">
          <Input
            id="model-file"
            type="file"
            accept=".obj"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Only .obj files are supported</strong>
        </p>
      </div>

      {modelFile && (
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            OBJ format detected. Make sure the dimensions below match the scale of your model.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="model-name">Model Name</Label>
          <Input
            id="model-name"
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Chair, Table, Lamp, etc."
          />
        </div>

        <div>
          <Label htmlFor="model-category">Category</Label>
          <select
            id="model-category"
            value={modelCategory}
            onChange={(e) => setModelCategory(e.target.value as FurnitureCategory)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
          >
            <option value="furniture">Furniture</option>
            <option value="decoration">Decoration</option>
            <option value="structure">Structure</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="width">Width (m)</Label>
          <Input
            id="width"
            type="number"
            step="0.1"
            min="0.1"
            value={dimensions.width}
            onChange={(e) =>
              setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0.1 })
            }
          />
        </div>
        <div>
          <Label htmlFor="height">Height (m)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            min="0.1"
            value={dimensions.height}
            onChange={(e) =>
              setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0.1 })
            }
          />
        </div>
        <div>
          <Label htmlFor="length">Length (m)</Label>
          <Input
            id="length"
            type="number"
            step="0.1"
            min="0.1"
            value={dimensions.length}
            onChange={(e) =>
              setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 0.1 })
            }
          />
        </div>
      </div>

      {previewError && (
        <Alert className="bg-red-50 text-red-800 border-red-200">
          <AlertDescription className="text-xs">{previewError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isUploading || !modelFile}>
          {isUploading ? (
            <Upload className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Add to Catalog
        </Button>
      </div>
    </form>
  );
};

export default ModelUploader;
