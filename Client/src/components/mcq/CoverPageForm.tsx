import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";

// Validation schema
const coverPageSchema = z.object({
  semester: z.string().nonempty(),
  campus: z.string().nonempty(),
  department: z.string().nonempty(),
  courseCode: z.string().nonempty(),
  courseName: z.string().nonempty(),
  examTitle: z.string().nonempty(),
  duration: z.string().nonempty(),
  versionNumber: z.string().nonempty(),
  noteContent: z.string().nonempty(),
  isImported: z.boolean(),
});

type CoverPageFormValues = z.infer<typeof coverPageSchema>;

// Field configuration
const fieldConfigs: {
  name: keyof CoverPageFormValues;
  label: string;
  as?: "textarea";
}[] = [
  { name: "semester", label: "Semester" },
  { name: "campus", label: "Campus" },
  { name: "department", label: "Department" },
  { name: "courseCode", label: "Course Code" },
  { name: "courseName", label: "Course Name" },
  { name: "examTitle", label: "Exam Title" },
  { name: "duration", label: "Duration" },
  { name: "versionNumber", label: "Version Number" },
  { name: "noteContent", label: "Note Content", as: "textarea" },
];

interface Props {
  handleAddOrUpdate: (values: CoverPageFormValues) => void;
  cancelEdit: () => void;
  initialValues?: CoverPageFormValues;
}

export default function CoverPageForm({
  handleAddOrUpdate,
  cancelEdit,
  initialValues,
}: Props) {
  const form = useForm<CoverPageFormValues>({
    resolver: zodResolver(coverPageSchema),
    defaultValues:
      initialValues ||
      (Object.fromEntries(
        fieldConfigs.map((f) => [f.name, ""]),
      ) as CoverPageFormValues),
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleAddOrUpdate({
      ...form.getValues(),
      isImported: true,
    });
  };

  return (
    <div
      className="flex-1 p-6 pr-6 rounded-md"
      style={{ backgroundColor: "oklch(23% 0 0)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="ml-6 text-2xl font-bold">Cover Page</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={form.handleSubmit(handleAddOrUpdate)}
          >
            Update
          </Button>
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".doc,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="cover-page-upload"
            />
            <label htmlFor="cover-page-upload">
              <Button variant="secondary" asChild>
                <span>Upload Cover Page</span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className="grid gap-4 md:grid-cols-2">
          {fieldConfigs.map((config) => (
            <FormField
              key={config.name}
              control={form.control}
              name={config.name}
              render={({ field }) => (
                <FormItem
                  className={
                    config.as === "textarea" ? "md:col-span-2" : undefined
                  }
                >
                  <FormLabel>{config.label}</FormLabel>
                  <FormControl>
                    {config.as === "textarea" ? (
                      <Textarea {...field} />
                    ) : (
                      <Input {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </form>
      </Form>
    </div>
  );
}
