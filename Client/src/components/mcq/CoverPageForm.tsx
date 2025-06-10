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
  placeholder?: string;
}[] = [
  { name: "semester", label: "Semester", placeholder: "e.g. Semester 1, 2025" },
  { name: "campus", label: "Campus", placeholder: "e.g. Campus: City" },
  { name: "department", label: "Department", placeholder: "e.g. Computer Science" },
  { name: "courseCode", label: "Course Code", placeholder: "e.g. COMPSCI 399 : Capstone: Computer" },
  { name: "courseName", label: "Course Name", placeholder: "e.g. COMPSCI 399" },
  { name: "examTitle", label: "Exam Title", placeholder: "e.g. Mid-Semester Test" },
  { name: "duration", label: "Duration", placeholder: "e.g. (Time Allowed: ONE hour)" },
  { name: "versionNumber", label: "Version Number", placeholder: "e.g. original" },
  { name: "noteContent", label: "Note Content", as: "textarea", placeholder: "e.g. This exam is restricted book. You are permitted to bring one A4 sheet of handwritten or typed notes" },
];

interface Props {
  handleAddOrUpdate: (values: CoverPageFormValues) => void;
  cancelEdit: () => void;
  initialValues?: CoverPageFormValues;
  onUpload: () => void;

}

export default function CoverPageForm({
  handleAddOrUpdate,
  cancelEdit,
  initialValues,
  onUpload,

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
      className="flex-1 p-6 pr-6 rounded-md border border-[#27272a] bg-[#0B0B0B]"
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
                          placeholder={config.placeholder}
                        />
                      ) : (
                        <Input
                          {...field}
                          className="border-[#27272A] text-white"
                          placeholder={config.placeholder}
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
        <Button variant="secondary" onClick={onUpload}>
          Upload Cover Page
        </Button>

      </div>
    </div>
  );
}
