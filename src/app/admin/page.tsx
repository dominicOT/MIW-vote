import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UploadCloud, Ticket, Users, BarChart3, Settings2 } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Settings2 className="mr-3 h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your voting event seamlessly.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Payment Verification</CardTitle>
            <UploadCloud className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Verify payment screenshots using AI and determine vote allocation.
            </CardDescription>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/payment-verification">Go to Verification</Link>
            </Button>
          </CardContent>
        </Card> */}

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">OTP Generation</CardTitle>
            <Ticket className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Generate One-Time Passwords for voters to access the platform.
            </CardDescription>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/otp-generation">Generate OTPs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Manage Candidates</CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Add, view, or manage the candidates participating in the vote.
            </CardDescription>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/manage-candidates">Manage Candidates</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">View Vote Results</CardTitle>
            <BarChart3 className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Monitor real-time voting statistics and final results.
            </CardDescription>
            <Button asChild className="w-full" variant="default">
              <Link href="/admin/results">View Results</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
