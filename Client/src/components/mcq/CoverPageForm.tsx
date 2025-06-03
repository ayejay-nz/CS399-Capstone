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
  onUploadFile?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CoverPageForm({
  handleAddOrUpdate,
  cancelEdit,
  initialValues,
  onUploadFile,
}: Props) {
  const form = useForm<CoverPageFormValues>({
    resolver: zodResolver(coverPageSchema),
    defaultValues:
      initialValues ||
      (Object.fromEntries(
        fieldConfigs.map((f) => [f.name, ""]),
      ) as CoverPageFormValues),
  });

  return (
    <div
      className="flex-1 p-6 pr-6 rounded-md border border-[#27272a]"
      style={{ backgroundColor: "oklch(0 0 0)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="ml-6 text-2xl font-bold">Cover Page</h1>
      </div>

      <div className="ml-6 mr-4">
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
                        <Textarea
                          {...field}
                          className="border-[#27272A] text-white"
                        />
                      ) : (
                        <Input
                          {...field}
                          className="border-[#27272A] text-white"
                        />
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
      <div className="ml-6 mr-4 flex justify-end items-center gap-2 mt-38">
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
            accept=".docx"
            onChange={onUploadFile}
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
  );
}
