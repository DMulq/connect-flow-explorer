import { useState, useEffect } from "react";
import FileUploader from "@/components/FileUploader";
import FlowVisualizer from "@/components/FlowVisualizer";
import { LogEntry, ParsedLogData } from "@/types/log";
import { processLogData } from "@/utils/logProcessor";
import { HelpCircle, RefreshCw, Upload } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [parsedData, setParsedData] = useState<ParsedLogData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dark mode
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (!saved) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleParsedData = (entries: LogEntry[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = processLogData(entries);
      console.log("Processed data:", data);
      setParsedData(data);
    } catch (err) {
      console.error("Error processing log data:", err);
      setError("Failed to process log data. Please check the file format.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/8c1aa2ff-dadc-4c73-9857-da2c7492c6b3.png" 
              alt="Contact Flow Logo" 
              className="h-8 w-8"
            />
            <h1 className="text-lg font-semibold text-foreground">Contact Flow Log Analyser</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!parsedData && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <HelpCircle size={16} />
                    <span className="hidden sm:inline">How to Use</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">How to Use</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-foreground">
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Search for your specific Contact ID in CloudWatch.</li>
                      <li>Export the logs as CSV including the following columns: <code className="bg-muted px-1.5 py-0.5 rounded text-sm">timestamp</code> & <code className="bg-muted px-1.5 py-0.5 rounded text-sm">message</code>.</li>
                      <li>Then upload it here.</li>
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        {!parsedData ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="aws-card w-full max-w-lg">
              <div className="aws-card-header">
                <h2 className="aws-card-title">Upload Log File</h2>
              </div>
              <div className="aws-card-content space-y-4">
                <p className="text-muted-foreground text-sm">
                  Upload your AWS Connect log file (CSV format) to visualize the contact flow
                </p>
                
                <FileUploader onDataParsed={handleParsedData} isLoading={isLoading} />
                
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            {/* Results Header Card */}
            <div className="aws-card">
              <div className="aws-card-header">
                <h2 className="aws-card-title">Contact Flow Visualization</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setParsedData(null)}
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setParsedData(null)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New File
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Flow Visualizer */}
            <div className="aws-card flex-1" style={{ minHeight: '65vh' }}>
              <div className="h-full">
                <FlowVisualizer data={parsedData} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-3">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2">
            <img 
              src="/lovable-uploads/8c1aa2ff-dadc-4c73-9857-da2c7492c6b3.png" 
              alt="Contact Flow Logo" 
              className="h-4 w-4 opacity-70"
            />
            <p>Contact Flow Log Analyser</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
