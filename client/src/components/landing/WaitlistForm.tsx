import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { insertWaitlistSignupSchema } from "@shared/schema";

// Extend the schema for frontend validation
const formSchema = insertWaitlistSignupSchema.extend({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaitlistForm() {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been added to the waitlist! We'll be in touch soon.",
        duration: 5000,
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join waitlist. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  function onSubmit(data: FormValues) {
    mutation.mutate(data);
  }

  return (
    <section id="waitlist" className="py-20 bg-gradient-to-r from-primary to-accent text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Waitlist</h2>
          <p className="text-xl opacity-90 mb-10">Be among the first to experience LaunchPad and transform how your team works.</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel className="text-white">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        {...field}
                        className="bg-white/10 border-white/30 focus:border-white text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel className="text-white">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        type="email"
                        {...field}
                        className="bg-white/10 border-white/30 focus:border-white text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel className="text-white">Company (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your company" 
                        {...field}
                        className="bg-white/10 border-white/30 focus:border-white text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-white hover:bg-white/90 text-primary font-semibold"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Join the Waitlist"
                )}
              </Button>
              
              <p className="text-sm opacity-80 mt-4">We'll never share your information with third parties.</p>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  );
}
