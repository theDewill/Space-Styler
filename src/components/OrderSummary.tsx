import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FurnitureItem } from "@/types/furniture";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentModal from "./PaymentModal";

interface OrderSummaryProps {
  items: FurnitureItem[];
}

const OrderSummary = ({ items }: OrderSummaryProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.07; // 7% tax rate
  const shipping = 29.99;
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  return (
    <>
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>LKR {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (7%):</span>
            <span>LKR {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping:</span>
            <span>LKR {shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium pt-4 border-t">
            <span>Total:</span>
            <span>LKR {total.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={total}
      />
    </>
  );
};

export default OrderSummary;
