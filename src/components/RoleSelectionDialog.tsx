
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface RoleSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleSelectionDialog = ({ isOpen, onClose }: RoleSelectionDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const navigate = useNavigate();

  const handleContinue = () => {
    // Only call onClose after navigation to prevent dialog from disappearing
    if (selectedRole === "admin") {
      navigate("/admin");
    } else {
      navigate("/cart");
    }
    // We move the onClose after navigation with a longer delay
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent dialog from closing when clicking outside
      if (!open) {
        return;
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="text-center font-playfair text-xl font-medium">Select your role</DialogTitle>
        <DialogDescription className="text-center text-sm text-muted-foreground">
          Please select a role to continue.
        </DialogDescription>
        
        <div className="space-y-4 py-2">
          <RadioGroup 
            value={selectedRole} 
            onValueChange={(value) => setSelectedRole(value as "user" | "admin")}
            className="gap-4"
          >
            <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="user" id="user" />
              <Label htmlFor="user" className="cursor-pointer flex-grow">User</Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="admin" id="admin" />
              <Label htmlFor="admin" className="cursor-pointer flex-grow">Admin</Label>
            </div>
          </RadioGroup>

          <Button 
            type="button" 
            className="w-full" 
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionDialog;
