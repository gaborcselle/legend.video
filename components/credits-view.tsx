import { Button } from "./ui/button";
import { IconCoin } from "./ui/icons";
import { useRouter } from 'next/navigation'

export function CreditsView() {
    const router= useRouter();

    const handleClick = (): void => {
        router.push('/credits');
    };

    return (
        <Button variant="ghost" onClick={handleClick}>
            Credits 
            <IconCoin className="size-3" />
            180
        </Button>
    );
}