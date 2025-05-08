import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Loader } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const paymentSchema = z.object({
  cardName: z.string().min(2, { message: "Name is required" }),
  cardNumber: z.string().min(16, { message: "Card number must be 16 digits" }).max(16),
  expiryDate: z.string().min(5, { message: "Expiry date is required (MM/YY)" }),
  cvv: z.string().min(3, { message: "CVV must be 3 digits" }).max(3),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

const PaymentModal = ({ isOpen, onClose, totalAmount }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const processPayment = (values: PaymentFormValues) => {
    setIsProcessing(true);

    // Simulate payment processing with a timeout
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      toast.success("Payment successful!", {
        description: `Your payment of LKR ${totalAmount.toFixed(2)} was completed successfully.`,
      });

      // Redirect to home page after showing success for a moment
      setTimeout(() => {
        onClose();
        navigate("/");
      }, 2000);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isComplete ? "Payment Successful" : "Enter Payment Details"}
          </DialogTitle>
        </DialogHeader>

        {isComplete ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-center text-muted-foreground">
              Thank you for your purchase. Redirecting to home page...
            </p>
          </div>
        ) : (
          <div className="py-4">
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-muted-foreground">Total Amount:</p>
              <p className="text-xl font-semibold">LKR {totalAmount.toFixed(2)}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(processPayment)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Card</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} disabled={isProcessing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234567812345678"
                          {...field}
                          disabled={isProcessing}
                          maxLength={16}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MM/YY"
                            {...field}
                            disabled={isProcessing}
                            maxLength={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123"
                            {...field}
                            disabled={isProcessing}
                            maxLength={3}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay LKR {totalAmount.toFixed(2)}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
