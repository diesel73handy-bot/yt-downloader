import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-4 shadow-xl border-border/50">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive items-center justify-center">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold font-display text-center text-foreground mb-2">404 Page Not Found</h1>
          <p className="mt-2 text-center text-muted-foreground mb-8 text-balance">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex justify-center">
             <Link href="/">
              <Button className="w-full font-semibold">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
