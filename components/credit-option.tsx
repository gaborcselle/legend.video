import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { cn } from '@/lib/utils'
import { IconCoin } from "./ui/icons";

interface ICreditOptionProps {
  amount: number;
  price: string;
  setAmount: (amount: number) => void;
  className?: string;
}

export default function CreditOption({amount, price, setAmount, className}: ICreditOptionProps) {
  return (
    <Card
      onClick={() => setAmount(amount)}
      className={cn("min-w-56 flex flex-col items-center cursor-pointer pb-5", className)}
    >
      <CardHeader className="font-bold items-center flex-row">
        <IconCoin />
        {amount} 
        &nbsp;Credits
      </CardHeader>
      <CardFooter>{price}</CardFooter>
    </Card>
  )
}
