import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const RetryCopy = ({
  retry,
  setRetry,
  link,
}: Readonly<{
  retry: boolean;
  setRetry: (value: boolean) => void;
  link: string;
}>) => {
  const [copied, setCopied] = useState(false);

  return (
    <Dialog open={retry} onOpenChange={setRetry}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy Link</DialogTitle>
          <DialogDescription>Copy the link below</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={link} readOnly />
          </div>
          <Button
            type="submit"
            onClick={async () => {
              setCopied(true);
              await navigator.clipboard.writeText(link);
              setTimeout(() => setCopied(false), 3000);
            }}
            size="sm"
            className={cn(
              "px-3",
              copied && "bg-green-500 hover:bg-green-600 text-white"
            )}
          >
            <span className="sr-only">Copy</span>
            <Copy />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetryCopy;
