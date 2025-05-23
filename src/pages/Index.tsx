
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import FlowVisualizer from "@/components/FlowVisualizer";
import { LogEntry, ParsedLogData } from "@/types/log";
import { processLogData } from "@/utils/logProcessor";
import { HelpCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    } catch (err) {
      console.error("Error processing log data:", err);
      setError("Failed to process log data. Please check the file format.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Contact Flow Visualizer</h1>
          
          {!parsedData && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <HelpCircle size={16} />
                  How to Use
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="mb-4">How to Use</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Search for your specific Contact ID in Cloud Watch.</li>
                    <li>Export the logs as CSV including the following columns: timestamp & message.</li>
                    <li>Then upload it here.</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-6 px-4 md:px-0 flex flex-col">
        {!parsedData ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="max-w-md w-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Upload Log File</h2>
                <p className="text-muted-foreground">
                  Upload your AWS Connect log file (CSV format) to visualize the contact flow
                </p>
              </div>
              
              <FileUploader onDataParsed={handleParsedData} isLoading={isLoading} />
              
              {error && (
                <div className="mt-4 p-3 bg-destructive/20 border border-destructive text-destructive rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Contact Flow Visualization</h2>
              </div>
              <button 
                onClick={() => setParsedData(null)} 
                className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md transition-colors"
              >
                Upload New File
              </button>
            </div>
            
            <div className="flex-1 border border-border rounded-lg overflow-hidden" style={{ height: '70vh' }}>
              <FlowVisualizer data={parsedData} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>Contact Flow Visualizer</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
