
import { useState, useRef } from "react";
import Papa from "papaparse";
import { LogEntry } from "@/types/log";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CloudUpload, File } from "lucide-react";

interface FileUploaderProps {
  onDataParsed: (data: LogEntry[]) => void;
  isLoading: boolean;
}

const FileUploader = ({ onDataParsed, isLoading }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error("CSV parsing errors:", results.errors);
          toast({
            title: "Error parsing file",
            description: "The file could not be parsed correctly.",
            variant: "destructive",
          });
          return;
        }

        // Validate the parsed data
        const data = results.data as LogEntry[];
        
        if (!data.length || !validateData(data[0])) {
          toast({
            title: "Invalid file format",
            description: "The file doesn't contain the expected columns: timestamp, message, logStreamName",
            variant: "destructive",
          });
          return;
        }

        onDataParsed(data);
        toast({
          title: "File processed successfully",
          description: `Parsed ${data.length} log entries.`,
        });
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Error parsing file",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const validateData = (entry: Record<string, unknown>) => {
    return typeof entry.timestamp !== 'undefined' && 
           typeof entry.message !== 'undefined' && 
           typeof entry.logStreamName !== 'undefined';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          accept=".csv"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <CloudUpload className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium mb-1">
              Drag and drop your log file here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files (CSV format only)
            </p>
          </div>
          
          {file && (
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-md">
              <File className="h-4 w-4" />
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
            </div>
          )}
        </div>
      </div>
      
      <Button
        className="w-full mt-4"
        disabled={!file || isLoading}
        onClick={() => file && parseFile(file)}
      >
        {isLoading ? "Processing..." : "Process Log File"}
      </Button>
    </div>
  );
};

export default FileUploader;
