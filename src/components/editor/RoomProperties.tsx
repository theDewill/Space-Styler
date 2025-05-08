import React, { useState, useEffect } from "react";
import { useProject } from "@/contexts/ProjectContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ModelPropertiesPanel from "./ModelPropertiesPanel";

const RoomProperties: React.FC = () => {
  const { currentProject, updateRoomProperties, view, setView } = useProject();

  const [roomName, setRoomName] = useState(currentProject?.room.name || "");
  const [roomWidth, setRoomWidth] = useState(currentProject?.room.dimensions.width || 5);
  const [roomLength, setRoomLength] = useState(currentProject?.room.dimensions.length || 4);
  const [roomHeight, setRoomHeight] = useState(currentProject?.room.dimensions.height || 2.5);
  const [wallColor, setWallColor] = useState(currentProject?.room.wallColor || "#ffffff");
  const [floorColor, setFloorColor] = useState(
    currentProject?.room.floorMaterial.color || "#a16207",
  );
  const [liveUpdates, setLiveUpdates] = useState(false);

  // Update local state when currentProject changes
  useEffect(() => {
    if (currentProject) {
      setRoomName(currentProject.room.name);
      setRoomWidth(currentProject.room.dimensions.width);
      setRoomLength(currentProject.room.dimensions.length);
      setRoomHeight(currentProject.room.dimensions.height);
      setWallColor(currentProject.room.wallColor);
      setFloorColor(currentProject.room.floorMaterial.color);
    }
  }, [currentProject]);

  // Apply changes immediately if live updates are enabled
  useEffect(() => {
    if (liveUpdates && currentProject) {
      updateRoomProperties({
        name: roomName,
        dimensions: {
          width: roomWidth,
          length: roomLength,
          height: roomHeight,
        },
        wallColor,
        floorMaterial: {
          ...currentProject.room.floorMaterial,
          color: floorColor,
        },
      });
    }
  }, [liveUpdates, roomWidth, roomLength, roomHeight, wallColor, floorColor]);

  const handleApplyChanges = () => {
    if (!currentProject) return;

    updateRoomProperties({
      name: roomName,
      dimensions: {
        width: roomWidth,
        length: roomLength,
        height: roomHeight,
      },
      wallColor,
      floorMaterial: {
        ...currentProject.room.floorMaterial,
        color: floorColor,
      },
    });
  };

  if (!currentProject) return null;

  // Check if a model is selected
  const isModelSelected = !!view.selectedFurnitureId;

  return (
    <div className="space-y-4">
      {/* Model Properties */}
      {isModelSelected ? (
        <>
          <div className="bg-muted/20 rounded-md p-4">
            <ModelPropertiesPanel />
          </div>
          <div className="border-t border-dashed my-2"></div>
        </>
      ) : null}

      <Accordion type="single" collapsible defaultValue="dimensions" className="w-full">
        <AccordionItem value="dimensions">
          <AccordionTrigger className="py-2 px-4">Room Dimensions</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="liveUpdates" className="text-sm">
                Live Updates
              </Label>
              <Switch id="liveUpdates" checked={liveUpdates} onCheckedChange={setLiveUpdates} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Width: {roomWidth}m</Label>
                <span className="text-xs text-muted-foreground">{roomWidth}m</span>
              </div>
              <Slider
                value={[roomWidth]}
                min={2}
                max={15}
                step={0.1}
                onValueChange={(value) => setRoomWidth(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Length: {roomLength}m</Label>
                <span className="text-xs text-muted-foreground">{roomLength}m</span>
              </div>
              <Slider
                value={[roomLength]}
                min={2}
                max={15}
                step={0.1}
                onValueChange={(value) => setRoomLength(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Height: {roomHeight}m</Label>
                <span className="text-xs text-muted-foreground">{roomHeight}m</span>
              </div>
              <Slider
                value={[roomHeight]}
                min={2}
                max={5}
                step={0.1}
                onValueChange={(value) => setRoomHeight(value[0])}
              />
            </div>

            {!liveUpdates && (
              <div className="pt-2">
                <Button onClick={handleApplyChanges} className="w-full">
                  Apply Dimension Changes
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="appearance">
          <AccordionTrigger className="py-2 px-4">Room Appearance</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallColor">Wall Color</Label>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: wallColor }} />
                <Input
                  id="wallColor"
                  type="color"
                  value={wallColor}
                  onChange={(e) => setWallColor(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorColor">Floor Color</Label>
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-md border"
                  style={{ backgroundColor: floorColor }}
                />
                <Input
                  id="floorColor"
                  type="color"
                  value={floorColor}
                  onChange={(e) => setFloorColor(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>

            {!liveUpdates && (
              <div className="pt-2">
                <Button onClick={handleApplyChanges} className="w-full">
                  Apply Appearance Changes
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default RoomProperties;
