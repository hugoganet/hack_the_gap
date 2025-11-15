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
import { useCurrentOrg } from "../../../use-current-org";
import {
  OrgDetailsFormSchema,
  type OrgDetailsFormSchemaType,
} from "../org.schema";

type ProductFormProps = {
  defaultValues: OrgDetailsFormSchemaType;
};

export const OrgDetailsForm = ({ defaultValues }: ProductFormProps) => {
  const form = useZodForm({
    schema: OrgDetailsFormSchema,
    defaultValues,
  });
  const router = useRouter();
  const org = useCurrentOrg();
  const mutation = useMutation({
    mutationFn: async (values: OrgDetailsFormSchemaType) => {
      if (!org?.id) {
        throw new Error("Organization ID is required");
      }

      return unwrapSafePromise(
        authClient.organization.update({
          data: {
            name: values.name,
            // Image upload disabled for hackathon
          },
          organizationId: org.id,
        }),
      );
    },
    onSuccess: (data) => {
      router.refresh();
      form.reset(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <FormAutoSave
      form={form}
      onSubmit={async (v) => {
        return mutation.mutateAsync(v);
      }}
      className="flex w-full flex-col gap-6 lg:gap-8"
    >
      <FormAutoSaveStickyBar />
      {/* Image upload removed for hackathon - keep it simple */}
      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <CardDescription>
            Use your organization's name or your name if you don't have an
            organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      <Card className="flex items-end p-6">
        <Button type="submit" className="w-fit">
          Save
        </Button>
      </Card>
    </FormAutoSave>
  );
};
