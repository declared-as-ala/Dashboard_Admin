"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createStore } from "@/lib/services/storeService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const storeSchema = z.object({
  nom: z.string().min(2, "Name must be at least 2 characters"),
  adresse: z.string().min(5, "Address must be at least 5 characters"),
  ville: z.string().min(2, "City must be at least 2 characters"),
  pays: z.string().min(2, "Country must be at least 2 characters"),
  mail: z.string().email("Invalid email address"),
  telephone: z.string().min(8, "Phone number must be at least 8 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface CreateStoreFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateStoreForm({ onSuccess, onCancel }: CreateStoreFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      nom: "",
      adresse: "",
      ville: "",
      pays: "",
      mail: "",
      telephone: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const onSubmit = async (data: StoreFormValues) => {
    try {
      setIsSubmitting(true);
      await createStore(data);
      toast({
        title: "Success",
        description: "Store created successfully",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error creating store:", error);
      toast({
        title: "Error",
        description: "Failed to create store",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter store name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adresse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter store address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ville"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter city" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter country" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="mail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Enter store email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter phone number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="any"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    placeholder="Enter latitude" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="any"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    placeholder="Enter longitude" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Store"}
          </Button>
        </div>
      </form>
    </Form>
  );
}