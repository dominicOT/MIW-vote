// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { verifyPaymentAndSuggestVotes, type VerifyPaymentAndSuggestVotesInput, type VerifyPaymentAndSuggestVotesOutput } from "@/ai/flows/verify-payment-and-suggest-votes";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
// import Image from "next/image";
// import { UploadCloud, CheckCircle, XCircle, Info, Lightbulb, Loader2 } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import Link from "next/link";

// const PaymentVerificationSchema = z.object({
//   paymentConfirmationScreenshot: z.instanceof(FileList).refine(files => files.length > 0, "Screenshot is required."),
//   expectedAmount: z.coerce.number().positive("Expected amount must be positive."),
//   voterName: z.string().min(1, "Voter name is required."),
// });

// type PaymentVerificationFormValues = z.infer<typeof PaymentVerificationSchema>;

// export default function PaymentVerificationForm() {
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);
//   const [aiResponse, setAiResponse] = useState<VerifyPaymentAndSuggestVotesOutput | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

//   const form = useForm<PaymentVerificationFormValues>({
//     resolver: zodResolver(PaymentVerificationSchema),
//   });

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewUrl(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//       form.setValue("paymentConfirmationScreenshot", event.target.files!);
//     } else {
//       setPreviewUrl(null);
//       form.setValue("paymentConfirmationScreenshot", new DataTransfer().files);
//     }
//   };

//   const onSubmit = async (data: PaymentVerificationFormValues) => {
//     setIsLoading(true);
//     setAiResponse(null);

//     const file = data.paymentConfirmationScreenshot[0];
//     const reader = new FileReader();

//     reader.onloadend = async () => {
//       try {
//         const base64Image = reader.result as string;
//         const input: VerifyPaymentAndSuggestVotesInput = {
//           paymentConfirmationScreenshot: base64Image,
//           expectedAmount: data.expectedAmount,
//           voterName: data.voterName,
//         };
        
//         const response = await verifyPaymentAndSuggestVotes(input);
//         setAiResponse(response);
//         toast({
//           title: "AI Verification Complete",
//           description: response.isPaymentValid ? "Payment appears valid." : "Payment verification issues found.",
//           variant: response.isPaymentValid ? "default" : "destructive",
//         });

//       } catch (error) {
//         console.error("AI Verification Error:", error);
//         toast({
//           title: "AI Verification Failed",
//           description: "An error occurred while processing the payment. Please check the console.",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <Card className="w-full shadow-xl">
//       <CardHeader>
//         <CardTitle className="text-2xl flex items-center"><UploadCloud className="mr-2 h-7 w-7 text-primary" /> AI Payment Verification</CardTitle>
//         <CardDescription>Upload a payment screenshot to verify and get suggested vote allocation.</CardDescription>
//       </CardHeader>
//       <form onSubmit={form.handleSubmit(onSubmit)}>
//         <CardContent className="space-y-6">
//           <div className="space-y-2">
//             <Label htmlFor="voterName" className="text-base">Voter Name</Label>
//             <Input id="voterName" {...form.register("voterName")} placeholder="Enter voter's name" className="text-base h-11" />
//             {form.formState.errors.voterName && <p className="text-sm text-destructive">{form.formState.errors.voterName.message}</p>}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="expectedAmount" className="text-base">Expected Amount (e.g., 10.00)</Label>
//             <Input id="expectedAmount" type="number" step="0.01" {...form.register("expectedAmount")} placeholder="Enter expected payment amount" className="text-base h-11" />
//             {form.formState.errors.expectedAmount && <p className="text-sm text-destructive">{form.formState.errors.expectedAmount.message}</p>}
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="paymentConfirmationScreenshot" className="text-base">Payment Screenshot</Label>
//             <Input id="paymentConfirmationScreenshot" type="file" accept="image/*" onChange={handleFileChange} className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 h-11 pt-2"/>
//             {form.formState.errors.paymentConfirmationScreenshot && <p className="text-sm text-destructive">{form.formState.errors.paymentConfirmationScreenshot.message}</p>}
//           </div>

//           {previewUrl && (
//             <div className="mt-4 border rounded-md p-2 bg-muted/50">
//               <p className="text-sm font-medium text-muted-foreground mb-2">Screenshot Preview:</p>
//               <Image src={previewUrl} alt="Payment screenshot preview" width={400} height={300} className="rounded-md object-contain max-h-[300px] w-auto mx-auto shadow-md" data-ai-hint="payment receipt" />
//             </div>
//           )}
//         </CardContent>
//         <CardFooter className="flex flex-col items-stretch gap-4">
//           <Button type="submit" disabled={isLoading} className="text-lg py-6">
//             {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</> : <><Lightbulb className="mr-2 h-5 w-5" /> Verify with AI</>}
//           </Button>

//           {aiResponse && (
//             <Alert variant={aiResponse.isPaymentValid ? "default" : "destructive"} className={aiResponse.isPaymentValid ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}>
//               {aiResponse.isPaymentValid ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
//               <AlertTitle className={aiResponse.isPaymentValid ? "text-green-700" : "text-red-700"}>
//                 {aiResponse.isPaymentValid ? "Payment Validated" : "Payment Validation Issues"}
//               </AlertTitle>
//               <AlertDescription className="space-y-2">
//                 <p><strong>Details:</strong> {aiResponse.paymentDetails}</p>
//                 <p><strong>Suggested Votes:</strong> <span className="font-bold text-xl">{aiResponse.suggestedVotes}</span></p>
//                 {aiResponse.isPaymentValid && (
//                    <Button asChild className="mt-2 bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
//                     <Link href={`/admin/otp-generation?votes=${aiResponse.suggestedVotes}&voter=${form.getValues("voterName")}`}>
//                       Proceed to Generate OTP ({aiResponse.suggestedVotes} Votes)
//                     </Link>
//                   </Button>
//                 )}
//               </AlertDescription>
//             </Alert>
//           )}
//            {!aiResponse && !isLoading && (
//             <Alert variant="default" className="border-primary/50 bg-primary/5">
//               <Info className="h-5 w-5 text-primary" />
//               <AlertTitle className="text-primary">Awaiting Verification</AlertTitle>
//               <AlertDescription>
//                 Fill out the form and upload a screenshot to let the AI verify the payment.
//               </AlertDescription>
//             </Alert>
//            )}
//         </CardFooter>
//       </form>
//     </Card>
//   );
// }
