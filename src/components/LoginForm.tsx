import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import RoleSelectionDialog from "./RoleSelectionDialog";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onRegisterClick: () => void;
  onClose?: () => void;
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = ({ onRegisterClick, onClose }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authCheck } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Here you would typically call an API to authenticate the user
      console.log("Login values:", values);

      // For demo purposes, let's just accept any credentials
      //

      const authResult = await authCheck(values.email, values.password);
      console.log("Auth Result:", authResult.authenticated);
      console.log("ERRR -> ", authResult.error);

      if (authResult.authenticated) {
        toast({
          title: "Login successful!",
          description: "Welcome back to Space Styler.",
        });
        if (authResult.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/cart");
        }
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        onClose();
      }

      // setTimeout(() => {
      //   toast({
      //     title: "Login successful!",
      //     description: "Welcome back to Luxe Spaces.",
      //   });

      //   // Close the authentication modal if the callback is provided
      //   if (onClose) {
      //     onClose();
      //   }

      //   // Show role selection dialog
      //   setShowRoleDialog(true);
      //   setIsLoading(false);
      // }, 1000);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleRoleDialogClose = () => {
    setShowRoleDialog(false);

    // Now close the auth modal if provided
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="text-center">
        <h3 className="font-playfair text-xl font-medium">Welcome Back</h3>
        <p className="text-sm text-muted-foreground">Enter your credentials to log in.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Your password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </Form>

      {/* <div className="text-center mt-4">
        <p className="text-sm">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-accent-gold hover:underline font-medium"
          >
            Register
          </button>
        </p>
      </div> */}

      {/* Role Selection Dialog */}
      <RoleSelectionDialog isOpen={showRoleDialog} onClose={handleRoleDialogClose} />
    </div>
  );
};

export default LoginForm;
