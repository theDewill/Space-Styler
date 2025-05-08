
// Mock data for 3D model codes and their URLs
export interface MockModel {
  code: string;
  name: string;
  url: string;
  category: 'furniture' | 'decoration' | 'structure';
  thumbnail?: string;
}

export const mockModels: MockModel[] = [
  {
    code: "CHAIR-001",
    name: "Office Chair",
    url: "https://firebasestorage.googleapis.com/v0/b/furniture-vis-app.appspot.com/o/models%2Foffice_chair.obj?alt=media",
    category: "furniture"
  },
  {
    code: "TABLE-001",
    name: "Coffee Table",
    url: "https://firebasestorage.googleapis.com/v0/b/furniture-vis-app.appspot.com/o/models%2Fcoffee_table.obj?alt=media",
    category: "furniture"
  },
  {
    code: "LAMP-001",
    name: "Floor Lamp",
    url: "https://firebasestorage.googleapis.com/v0/b/furniture-vis-app.appspot.com/o/models%2Ffloor_lamp.obj?alt=media",
    category: "decoration"
  },
  {
    code: "SOFA-001",
    name: "Modern Sofa",
    url: "https://firebasestorage.googleapis.com/v0/b/furniture-vis-app.appspot.com/o/models%2Fmodern_sofa.obj?alt=media",
    category: "furniture" 
  },
  {
    code: "PLANT-001",
    name: "Potted Plant",
    url: "https://firebasestorage.googleapis.com/v0/b/furniture-vis-app.appspot.com/o/models%2Fpotted_plant.obj?alt=media",
    category: "decoration"
  },
  {
    code: "WALL-001",
    name: "Room Divider",
    url: "https://firebasestorage.googleapis.com/v0/b/furniture-vis-app.appspot.com/o/models%2Froom_divider.obj?alt=media",
    category: "structure"
  }
];
