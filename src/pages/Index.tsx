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
        <div className="py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/8c1aa2ff-dadc-4c73-9857-da2c7492c6b3.png" 
              alt="Contact Flow Logo" 
              className="h-8 w-8"
            />
            <h1 className="text-xl font-bold">CloudWatch Amazon Connect Log Explorer</h1>
          </div>
          
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
      <main className="flex-1 py-6 px-4 flex flex-col">
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
              
              <p className="mt-4 text-xs text-muted-foreground text-center">
                🔒 Your data is processed locally in your browser. We do not store or transmit your log files.
              </p>
              
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
        <div className="px-4 text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2">
            <img 
              src="/lovable-uploads/8c1aa2ff-dadc-4c73-9857-da2c7492c6b3.png" 
              alt="Contact Flow Logo" 
              className="h-5 w-5"
            />
            <p>CloudWatch Amazon Connect Log Explorer</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
