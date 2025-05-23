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
  course_code: z.string().nonempty(),
  course_name: z.string().nonempty(),
  exam_title: z.string().nonempty(),
  duration: z.string().nonempty(),
  version_number: z.string().nonempty(),
  note_content: z.string().nonempty(),
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
  { name: "course_code", label: "Course Code" },
  { name: "course_name", label: "Course Name" },
  { name: "exam_title", label: "Exam Title" },
  { name: "duration", label: "Duration" },
  { name: "version_number", label: "Version Number" },
  { name: "note_content", label: "Notes", as: "textarea" },
];

export default function CoverPageForm() {
  const form = useForm<CoverPageFormValues>({
    resolver: zodResolver(coverPageSchema),
    defaultValues: Object.fromEntries(
      fieldConfigs.map((f) => [f.name, ""])
    ) as CoverPageFormValues,
  });

  const onSubmit = (values: CoverPageFormValues) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        {fieldConfigs.map((config) => (
          <FormField
            key={config.name}
            control={form.control}
            name={config.name}
            render={({ field }) => (
              <FormItem className={config.as === "textarea" ? "md:col-span-2" : undefined}>
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

        <Button type="submit" className="md:col-span-2">
          Submit
        </Button>
      </form>
    </Form>
  );
}