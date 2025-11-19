"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Command, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { useDebounceFn } from "@/hooks/use-debounce-fn";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { CourseCreationProgress } from "./course-creation-progress";

// Schema will be created inside component to access translations


type CreateCourseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateCourseDialog({
  open,
  onOpenChange,
}: CreateCourseDialogProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.courseDialog");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApiComplete, setIsApiComplete] = useState(false);
  const [courseMetadata, setCourseMetadata] = useState<{
    name: string;
    subject: string;
  } | null>(null);

  const createCourseSchema = z.object({
    subject: z.string().min(1, t("errors.subjectRequired")),
    name: z.string().min(3, t("errors.nameMin")),
    learningGoal: z.string().min(10, t("errors.goalMin")),
  });

  type CreateCourseFormData = z.infer<typeof createCourseSchema>;

  const form = useZodForm({
    schema: createCourseSchema,
    defaultValues: {
      subject: "",
      name: "",
      learningGoal: "",
    },
  });

  type SubjectOption = { id: string; name: string };

  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);

  const searchSubjects = async (q: string) => {
    const query = q.trim();
    if (!query) {
      setSubjectOptions([]);
      setSubjectOpen(false);
      return;
    }
    try {
      setSubjectLoading(true);
      const res = await fetch(`/api/subjects?q=${encodeURIComponent(query)}&take=8`);
      if (!res.ok) {
        throw new Error("searchFailed");
      }
      const data = (await res.json()) as SubjectOption[];
      setSubjectOptions(data);
      setSubjectOpen(data.length > 0);
    } catch {
      // keep UX non-blocking on errors
      setSubjectOptions([]);
      setSubjectOpen(false);
    } finally {
      setSubjectLoading(false);
    }
  };

  const debouncedSearchSubjects = useDebounceFn((q: string) => {
    void searchSubjects(q);
  }, 300);

  const onSubmit = async (data: CreateCourseFormData) => {
    setIsSubmitting(true);
    setCourseMetadata({
      name: data.name,
      subject: data.subject,
    });
    setIsApiComplete(false);
    
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      const course = await response.json();
      
      // Signal API completion
      setIsApiComplete(true);
      
      // Wait a moment for the progress to complete
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t("toast.success"));
      onOpenChange(false);
      form.reset();
      setCourseMetadata(null);
      setIsApiComplete(false);
      router.push(`/dashboard/courses/${course.id}`);
      router.refresh();
    } catch (error) {
      toast.error(t("toast.error"));
      setIsSubmitting(false);
      setCourseMetadata(null);
      setIsApiComplete(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {isSubmitting && courseMetadata ? (
          <CourseCreationProgress
            courseName={courseMetadata.name}
            subjectName={courseMetadata.subject}
            isProcessingComplete={isApiComplete}
            onComplete={() => {
              // Progress animation complete
            }}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>
                {t("description")}
              </DialogDescription>
            </DialogHeader>
            <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.subject.label")}</FormLabel>
                  <FormControl>
                    <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                      <PopoverAnchor asChild>
                        <Input
                          placeholder={t("fields.subject.placeholder")}
                          {...field}
                          onKeyDown={(e) => {
                            // Prevent nested components (e.g., Command/cmdk) from capturing typing (bubble phase)
                            e.stopPropagation();
                          }}
                          onKeyDownCapture={(e) => {
                            // Prevent capture-phase listeners (cmdk) from intercepting typing
                            e.stopPropagation();
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            debouncedSearchSubjects(e.target.value);
                          }}
                          onFocus={() => {
                            if (field.value?.trim()) {
                              debouncedSearchSubjects(field.value);
                            }
                          }}
                        />
                      </PopoverAnchor>
                      <PopoverContent
                        className="p-0 w-[300px]"
                        align="start"
                        side="bottom"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <Command shouldFilter={false}>
                          <CommandList>
                            <CommandEmpty>{t("fields.subject.empty")}</CommandEmpty>
                            {subjectLoading ? (
                              <div className="p-2 text-sm text-muted-foreground">{t("fields.subject.searching")}</div>
                            ) : null}
                            {subjectOptions.map((s) => (
                              <CommandItem
                                key={s.id}
                                value={s.name}
                                onSelect={() => {
                                  form.setValue("subject", s.name, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  });
                                  setSubjectOpen(false);
                                }}
                              >
                                {s.name}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.name.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="learningGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.learningGoal.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("fields.learningGoal.placeholder")}
                      className="min-h-[200px] resize-y font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("actions.create")}
            </Button>
          </DialogFooter>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
