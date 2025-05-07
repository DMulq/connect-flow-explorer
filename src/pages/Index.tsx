
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import FlowVisualizer from "@/components/FlowVisualizer";
import { LogEntry, ParsedLogData } from "@/types/log";
import { processLogData } from "@/utils/logProcessor";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [parsedData, setParsedData] = useState<ParsedLogData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParsedData = (entries: LogEntry[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Process the log entries into a format suitable for visualization
      const data = processLogData(entries);
      console.log("Processed data:", data);
      setParsedData(data);
      toast.success("Log data processed successfully");
    } catch (err) {
      console.error("Error processing log data:", err);
      setError("Failed to process log data. Please check the file format.");
      toast.error("Failed to process log data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/80">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient">Contact Flow Visualizer</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4 md:px-0 flex flex-col">
        {!parsedData ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="max-w-md w-full card-gradient p-8 rounded-xl shadow-lg">
              <div className="text-center mb-7">
                <h2 className="text-3xl font-bold mb-3 text-gradient-primary">Upload Log File</h2>
                <p className="text-muted-foreground">
                  Upload your AWS Connect log file (CSV format) to visualize the contact flow
                </p>
              </div>
              
              <FileUploader onDataParsed={handleParsedData} isLoading={isLoading} />
              
              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/40 text-destructive rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gradient-primary">Contact Flow Visualization</h2>
              </div>
              <Button 
                onClick={() => setParsedData(null)} 
                variant="outline"
                className="hover:bg-primary/20 hover:text-primary text-primary/80 border-primary/20"
              >
                Upload New File
              </Button>
            </div>
            
            <div className="flex-1 glass-container rounded-xl overflow-hidden" style={{ height: '75vh' }}>
              <FlowVisualizer data={parsedData} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-4 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>Contact Flow Visualizer</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
