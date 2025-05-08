import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Loader2, Trash2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FurnitureCatalogItem } from "@/types/furniture";
import { fetchAllDocuments, deleteDocumentsByCriteria } from "@/../fbcodes";
import AddFurnitureDialog from "@/components/AddFurnitureDialog";
import { useToast } from "@/hooks/use-toast";

// Mock data for furniture items
// const mockFurnitureItems: FurnitureCatalogItem[] = [
//   {
//     id: "1",
//     name: "Modern Sofa",
//     category: "Sofa",
//     price: 1299.99,
//     color: "Gray",
//     material: "Velvet",
//     picture: "/placeholder.svg",
//     modelCode: "SOF-MOD-001",
//   },
//   {
//     id: "2",
//     name: "Wooden Coffee Table",
//     category: "Table",
//     price: 499.99,
//     color: "Natural Wood",
//     material: "Oak",
//     picture: "/placeholder.svg",
//     modelCode: "TBL-COF-002",
//   },
//   {
//     id: "3",
//     name: "Lounge Chair",
//     category: "Chair",
//     price: 799.99,
//     color: "Black",
//     material: "Leather",
//     picture: "/placeholder.svg",
//     modelCode: "CHR-LNG-003",
//   },
// ];

const CatalogManager = () => {
  const [furnitureItems, setFurnitureItems] = useState<FurnitureCatalogItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FurnitureCatalogItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadFurniture = async () => {
      setIsLoading(true);
      try {
        const allFurniture = await fetchAllDocuments("f_catalog");

        // Convert the documents to the correct format
        const formattedFurniture: FurnitureCatalogItem[] = allFurniture.map((doc) => ({
          id: doc.id,
          name: doc.name || "",
          ctg: doc.ctg || "",
          price: doc.price || 0,
          color: doc.color || "",
          material: doc.material || "",
          picture: doc.picture || "/placeholder.svg",
          m_code: doc.m_code || "",
          // The model field is stored as a URL in Firestore, not as a File object
        }));

        setFurnitureItems(formattedFurniture);
        console.log("Fetched furniture items:", formattedFurniture);
      } catch (error) {
        console.error("Error fetching furniture items:", error);
        toast({
          title: "Error",
          description: "Failed to load furniture catalog",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFurniture();
  }, [toast]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAddFurniture = (newFurniture: FurnitureCatalogItem) => {
    setFurnitureItems([...furnitureItems, { ...newFurniture, id: String(Date.now()) }]);
    setIsAddDialogOpen(false);

    toast({
      title: "Success",
      description: "Furniture model added successfully",
    });
  };

  const handleDeleteClick = (item: FurnitureCatalogItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeletingItem(itemToDelete.id);
    setShowDeleteConfirm(false);

    try {
      // Call the deleteDocumentsByCriteria method with m_code as criteria
      await deleteDocumentsByCriteria("f_catalog", { m_code: itemToDelete.m_code });

      // Update the local state by removing the deleted item
      setFurnitureItems((prevItems) =>
        prevItems.filter((item) => item.m_code !== itemToDelete.m_code),
      );

      toast({
        title: "Item Deleted",
        description: `${itemToDelete.name} has been removed from the catalog.`,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error removing the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingItem(null);
      setItemToDelete(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto py-24 flex-grow">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center text-muted-foreground hover:text-foreground"
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-playfair font-semibold">Catalog Manager</h1>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Furniture Model
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading catalog...</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Model Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {furnitureItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No furniture items found. Add your first item!
                    </TableCell>
                  </TableRow>
                ) : (
                  furnitureItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded overflow-hidden border">
                          <img
                            src={item.picture}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback for broken images
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{item.m_code}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.ctg}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.color}</TableCell>
                      <TableCell>{item.material}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(item)}
                          disabled={isDeletingItem === item.id}
                          className="flex items-center gap-1"
                        >
                          {isDeletingItem === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          {isDeletingItem === item.id ? "Deleting..." : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AddFurnitureDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddFurniture}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default CatalogManager;
