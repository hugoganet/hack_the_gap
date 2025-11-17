"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormAutoSave } from "@/features/form/form-auto-save";
import { FormAutoSaveStickyBar } from "@/features/form/form-auto-save-sticky-bar";
import { authClient } from "@/lib/auth-client";
import { unwrapSafePromise } from "@/lib/promises";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const UserDetailsFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type UserDetailsFormSchemaType = z.infer<typeof UserDetailsFormSchema>;

type UserDetailsFormProps = {
  defaultValues: UserDetailsFormSchemaType;
};

export const UserDetailsForm = ({ defaultValues }: UserDetailsFormProps) => {
  const form = useZodForm({
    schema: UserDetailsFormSchema,
    defaultValues,
  });
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: UserDetailsFormSchemaType) => {
      return unwrapSafePromise(
        authClient.updateUser({
          name: values.name,
        }),
      );
    },
    onSuccess: () => {
      router.refresh();
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <FormAutoSave
        form={form}
        onSubmit={async (v) => {
          return mutation.mutateAsync(v);
        }}
        className="flex w-full flex-col gap-6 lg:gap-8"
      >
        <FormAutoSaveStickyBar />
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card className="flex items-end p-6">
          <Button type="submit" className="w-fit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Card>
      </FormAutoSave>
    </>
  );
};
