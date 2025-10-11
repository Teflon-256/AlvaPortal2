import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Globe } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Italy", "Spain",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland",
  "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Greece", "Portugal", "Ireland",
  "Japan", "South Korea", "Singapore", "Hong Kong", "Taiwan", "Malaysia", "Thailand", "Indonesia",
  "Philippines", "Vietnam", "India", "China", "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain",
  "Oman", "Egypt", "South Africa", "Nigeria", "Kenya", "Morocco", "Tunisia", "Israel", "Turkey",
  "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Mexico", "Costa Rica", "Panama", "Uruguay",
  "New Zealand", "Russia", "Ukraine", "Kazakhstan", "Pakistan", "Bangladesh", "Other"
].sort();

export default function ProfileSetup() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      country: user?.country || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        country: user.country || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(217,100%,70%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217,100%,70%) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      <Card className="max-w-2xl w-full bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center p-4 md:p-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 md:w-8 md:h-8 text-black" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            COMPLETE YOUR PROFILE
          </CardTitle>
          <CardDescription className="text-sm md:text-base text-zinc-400 mt-2">
            Please provide your information to get started with AlvaCapital
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-400 font-mono">First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your first name"
                          className="bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500"
                          data-testid="input-first-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-400 font-mono">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your last name"
                          className="bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500"
                          data-testid="input-last-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-400 font-mono flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Country
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500" data-testid="select-country">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-cyan-500/30 max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country} className="text-white hover:bg-cyan-500/10">
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold text-base md:text-lg py-4 md:py-6"
                disabled={updateProfileMutation.isPending}
                data-testid="button-complete-profile"
              >
                {updateProfileMutation.isPending ? "SAVING..." : "COMPLETE PROFILE"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <style>{`
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  );
}
