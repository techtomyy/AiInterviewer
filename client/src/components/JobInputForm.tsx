import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Briefcase, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const jobInputSchema = z.object({
  jobRole: z.string().min(1, "Job role is required"),
  jobDescription: z
    .string()
    .min(10, "Job description must be at least 10 characters"),
  resume: z.string().optional(),
});

type JobInputFormData = z.infer<typeof jobInputSchema>;

interface JobInputFormProps {
  onSubmit: (data: JobInputFormData) => void;
  loading?: boolean;
}

export default function JobInputForm({
  onSubmit,
  loading = false,
}: JobInputFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JobInputFormData>({
    resolver: zodResolver(jobInputSchema),
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".txt")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or text file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setValue("resume", content);
      };
      reader.readAsText(file);
    }
  };

  const handleFormSubmit = (data: JobInputFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <span>Job Information</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Provide details about the position you're preparing for
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Job Role */}
          <div className="space-y-2">
            <Label htmlFor="jobRole">Job Role / Position *</Label>
            <Input
              id="jobRole"
              placeholder="e.g., Frontend Developer, Product Manager"
              {...register("jobRole")}
              className={errors.jobRole ? "border-red-500" : ""}
            />
            {errors.jobRole && (
              <p className="text-sm text-red-500">{errors.jobRole.message}</p>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here..."
              rows={4}
              {...register("jobDescription")}
              className={errors.jobDescription ? "border-red-500" : ""}
            />
            {errors.jobDescription && (
              <p className="text-sm text-red-500">
                {errors.jobDescription.message}
              </p>
            )}
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("resume")?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{resumeFile ? resumeFile.name : "Upload Resume"}</span>
              </Button>
              {resumeFile && (
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>Uploaded</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload your resume (PDF or TXT, max 5MB) to get more personalized
              questions
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              "Generate Interview Questions"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
