import React from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Palette, RotateCcw, BoxIcon, Move, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ModelPropertiesPanel: React.FC = () => {
  const { currentProject, view, updateFurniture, setView, setTransformMode, removeFurniture } =
    useProject();

  // Find selected furniture
  const selectedFurniture = currentProject?.furniture.find(
    (item) => item.id === view.selectedFurnitureId,
  );

  if (!selectedFurniture) {
    return (
      <div className="p-4 bg-muted/30 rounded-md text-center">
        <p className="text-muted-foreground">Select a model to edit its properties</p>
      </div>
    );
  }

  // Handle remove furniture
  const handleRemoveFurniture = () => {
    if (window.confirm(`Are you sure you want to delete "${selectedFurniture.name}"?`)) {
      removeFurniture(selectedFurniture.id);
      toast("3D model removed from room");
    }
  };

  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFurniture(selectedFurniture.id, {
      material: {
        ...selectedFurniture.material,
        color: e.target.value,
      },
    });
  };

  // Handle dimensions change
  const handleDimensionChange = (dimension: "width" | "height" | "length", value: number) => {
    updateFurniture(selectedFurniture.id, {
      dimensions: {
        ...selectedFurniture.dimensions,
        [dimension]: value,
      },
    });
  };

  // Handle rotation change for specific axis
  const handleRotationChange = (axis: "x" | "y", value: number) => {
    updateFurniture(selectedFurniture.id, {
      rotation: {
        ...selectedFurniture.rotation,
        [axis]: value,
      },
    });
  };

  // Handle vertical position change (move up/down)
  const handlePositionChange = (direction: "up" | "down", amount: number = 0.1) => {
    const newY = selectedFurniture.position.y + (direction === "up" ? amount : -amount);
    updateFurniture(selectedFurniture.id, {
      position: {
        ...selectedFurniture.position,
        y: Math.max(0, newY), // Prevent going below ground level
      },
    });

    toast(`Model moved ${direction}`, {
      description: `New height: ${newY.toFixed(2)}m`,
    });
  };

  // Reset vertical position to default 0.4m
  const resetVerticalPosition = () => {
    updateFurniture(selectedFurniture.id, {
      position: {
        ...selectedFurniture.position,
        y: 0.4, // Default vertical position is 0.4m
      },
    });

    toast("Default vertical position restored", {
      description: "Object set to 0.40m above ground",
    });
  };

  // Set transform mode with enhanced feedback
  const handleTransformMode = (mode: "translate" | "rotate" | "scale") => {
    setTransformMode(mode);

    const modeMap = {
      translate: "move",
      rotate: "rotate",
      scale: "resize",
    };

    toast(`${modeMap[mode]} mode activated`, {
      description: `You can now ${modeMap[mode]} the selected model in 3D view`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{selectedFurniture.name}</h3>

        {/* Add delete button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemoveFurniture}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </Button>
      </div>

      {/* Transform Controls */}
      <div className="bg-muted/30 p-2 rounded-md">
        <Label className="text-xs mb-1 block">Transform Controls</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={view.transformMode === "translate" ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleTransformMode("translate")}
            className="flex items-center justify-center"
          >
            <Move className="h-4 w-4 mr-1" />
            Move
          </Button>
          <Button
            variant={view.transformMode === "rotate" ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleTransformMode("rotate")}
            className="flex items-center justify-center"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Rotate
          </Button>
          <Button
            variant={view.transformMode === "scale" ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleTransformMode("scale")}
            className="flex items-center justify-center"
          >
            <BoxIcon className="h-4 w-4 mr-1" />
            Scale
          </Button>
        </div>
      </div>

      {/* Vertical Position Controls */}
      <div className="bg-muted/30 p-2 rounded-md">
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">
            Vertical Position: {selectedFurniture.position.y.toFixed(2)}m
          </Label>
          <Button variant="ghost" size="sm" onClick={resetVerticalPosition} className="text-xs h-6">
            Reset (0.40m)
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePositionChange("up")}
            className="flex items-center justify-center"
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            Move Up
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePositionChange("down")}
            className="flex items-center justify-center"
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            Move Down
          </Button>
        </div>
      </div>

      {/* Color Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Color
          </Label>
          <div
            className="w-6 h-6 rounded-md border"
            style={{ backgroundColor: selectedFurniture.material.color }}
          />
        </div>
        <Input
          type="color"
          value={selectedFurniture.material.color}
          onChange={handleColorChange}
          className="w-full h-8"
        />
      </div>

      {/* Size Controls */}
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Width: {selectedFurniture.dimensions.width.toFixed(2)}m</Label>
            <span className="text-xs text-muted-foreground">
              {selectedFurniture.dimensions.width.toFixed(2)}m
            </span>
          </div>
          <Slider
            value={[selectedFurniture.dimensions.width]}
            min={0.1}
            max={5}
            step={0.1}
            onValueChange={(value) => handleDimensionChange("width", value[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Height: {selectedFurniture.dimensions.height.toFixed(2)}m</Label>
            <span className="text-xs text-muted-foreground">
              {selectedFurniture.dimensions.height.toFixed(2)}m
            </span>
          </div>
          <Slider
            value={[selectedFurniture.dimensions.height]}
            min={0.1}
            max={5}
            step={0.1}
            onValueChange={(value) => handleDimensionChange("height", value[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Length: {selectedFurniture.dimensions.length.toFixed(2)}m</Label>
            <span className="text-xs text-muted-foreground">
              {selectedFurniture.dimensions.length.toFixed(2)}m
            </span>
          </div>
          <Slider
            value={[selectedFurniture.dimensions.length]}
            min={0.1}
            max={5}
            step={0.1}
            onValueChange={(value) => handleDimensionChange("length", value[0])}
          />
        </div>
      </div>

      {/* Horizontal Rotation Control (Y-axis) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>
            Horizontal Rotation: {(selectedFurniture.rotation.y * (180 / Math.PI)).toFixed(0)}°
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRotationChange("y", 0)}
            className="h-6 text-xs"
          >
            Reset
          </Button>
        </div>
        <Slider
          value={[selectedFurniture.rotation.y]}
          min={0}
          max={Math.PI * 2}
          step={Math.PI / 12}
          onValueChange={(value) => handleRotationChange("y", value[0])}
        />
      </div>

      {/* Vertical Rotation Control (X-axis) with default 90 degrees (π/2) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>
            Vertical Rotation: {(selectedFurniture.rotation.x * (180 / Math.PI)).toFixed(0)}°
          </Label>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRotationChange("x", Math.PI / 2)}
              className="h-6 text-xs"
            >
              90°
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRotationChange("x", 0)}
              className="h-6 text-xs"
            >
              Reset
            </Button>
          </div>
        </div>
        <Slider
          value={[selectedFurniture.rotation.x]}
          min={-Math.PI / 2}
          max={Math.PI / 2}
          step={Math.PI / 24}
          onValueChange={(value) => handleRotationChange("x", value[0])}
        />
      </div>
    </div>
  );
};

export default ModelPropertiesPanel;
