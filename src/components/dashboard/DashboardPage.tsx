import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import NewProjectDialog from "./NewProjectDialog";
import ImportSceneDialog from "./ImportSceneDialog";
import ProjectCard from "./ProjectCard";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useProject } from "@/contexts/ProjectContext";
import { Plus } from "lucide-react";

const DashboardPage: React.FC = () => {
  const { projects } = useProject();
  const { setAppTheme } = useAppTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setAppTheme("furniture");
    document.title = "Dashboard | Furniture Visualization Pro";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <div className="flex space-x-2">
            <ImportSceneDialog />
            <NewProjectDialog />
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 border border-dashed border-muted rounded-lg p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-xl font-medium mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Create your first project to start designing beautiful room layouts with furniture.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
              <ImportSceneDialog />
              <NewProjectDialog />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
