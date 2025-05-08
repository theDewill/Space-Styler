import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FurnitureCatalogItem } from "@/types/furniture";
import { uploadFileToStorage, addDocument } from "@/../fbcodes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const furnitureFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  ctg: z.string().min(2, { message: "Category is required." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  color: z.string().min(2, { message: "Color is required." }),
  material: z.string().min(2, { message: "Material is required." }),
  m_code: z.string().min(2, { message: "Model code is required." }),
});

type FurnitureFormValues = z.infer<typeof furnitureFormSchema>;

interface AddFurnitureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (furniture: FurnitureCatalogItem) => void;
}

const AddFurnitureDialog = ({ isOpen, onClose, onSubmit }: AddFurnitureDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const form = useForm<FurnitureFormValues>({
    resolver: zodResolver(furnitureFormSchema),
    defaultValues: {
      name: "",
      ctg: "",
      price: 0,
      color: "",
      material: "",
      m_code: "",
    },
  });

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPictureFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPicturePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModelFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (values: FurnitureFormValues) => {
    setIsLoading(true);

    // Create a new furniture item
    const newFurniture: FurnitureCatalogItem = {
      // Will be replaced on submission
      ...values,
      picture: picturePreview || "/placeholder.svg",
      model: modelFile || undefined,
    };

    let pictureUrl = "";
    if (pictureFile) {
      pictureUrl = await uploadFileToStorage(
        "hci_furniture",
        pictureFile,
        `${values.m_code}-picture`,
      );
    }

    // Upload 3D model if available
    let modelUrl = "";
    if (modelFile) {
      modelUrl = await uploadFileToStorage("hci_models", modelFile, `${values.m_code}-model`);
    }

    // Simulate API call delay
    const FurnDoc = await addDocument("f_catalog", {
      name: values.name,
      ctg: values.ctg,
      price: values.price,
      color: values.color,
      material: values.material,
      m_code: values.m_code,
      picture: pictureUrl,
      model: modelUrl,
    });

    onSubmit(newFurniture);
    setIsLoading(false);

    // Reset form
    form.reset();
    setPictureFile(null);
    setModelFile(null);
    setPicturePreview(null);

    // setTimeout(() => {
    //   onSubmit(newFurniture);
    //   setIsLoading(false);

    //   // Reset form
    //   form.reset();
    //   setPictureFile(null);
    //   setModelFile(null);
    //   setPicturePreview(null);
    // }, 1500);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-playfair font-semibold text-center">
            Add New Furniture Model
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Modern Sofa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ctg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Sofa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="899.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input placeholder="Black" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input placeholder="Leather" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="m_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SOF-MOD-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Picture</FormLabel>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="flex-1"
                />
                {picturePreview && (
                  <div className="h-16 w-16 border rounded overflow-hidden flex-shrink-0">
                    <img
                      src={picturePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>3D Model File</FormLabel>
              <Input type="file" accept=".obj,.glb,.gltf" onChange={handleModelChange} />
              {modelFile && <p className="text-xs text-muted-foreground">{modelFile.name}</p>}
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Furniture"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFurnitureDialog;
