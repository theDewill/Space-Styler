import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../layout/Header";
import FurnitureCatalog from "./FurnitureCatalog";
import RoomCanvas from "./RoomCanvas";
import ThreeDView from "./ThreeDView";
import RoomProperties from "./RoomProperties";
import EditorToolbar from "./EditorToolbar";
import { useProject } from "@/contexts/ProjectContext";

const EditorPage: React.FC = () => {
  const { currentProject, view, loadProject } = useProject();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // If ID is provided in URL, try to load that specific project
    if (id) {
      loadProject(id);
    } else if (!currentProject) {
      navigate("/dashboard");
      return;
    }

    if (currentProject) {
      document.title = `${currentProject.name} | SpaceStyler`;
    }
  }, [currentProject, navigate, id, loadProject]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex flex-col">
        <EditorToolbar />
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 h-full">
          {/* Left sidebar - Furniture catalog */}
          <div className="border-r bg-muted/10 hidden md:block md:col-span-1 h-full overflow-hidden">
            <FurnitureCatalog />
          </div>

          {/* Main canvas area */}
          <div className="col-span-1 lg:col-span-3 xl:col-span-3 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 p-4 bg-gray-100">
              {view.mode === "2d" ? <RoomCanvas /> : <ThreeDView />}
            </div>
          </div>

          {/* Right sidebar - Room properties */}
          <div className="border-l bg-muted/10 hidden lg:block lg:col-span-1 xl:col-span-1 p-4 overflow-y-auto">
            <RoomProperties />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
