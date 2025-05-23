
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import FlowVisualizer from "@/components/FlowVisualizer";
import { LogEntry, ParsedLogData } from "@/types/log";
import { processLogData } from "@/utils/logProcessor";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { FileUpIcon, UploadCloudIcon, BarChart3Icon, HelpCircleIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Index = () => {
  const [parsedData, setParsedData] = useState<ParsedLogData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHowToUse, setShowHowToUse] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-aws-darknavy via-aws-navy to-aws-charcoal">
      {/* Header */}
      <header className="border-b border-aws-blue/20 backdrop-blur-sm bg-aws-darknavy/70 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3Icon className="h-6 w-6 text-aws-orange" />
            <h1 className="text-2xl font-semibold text-gradient">AWS Connect Flow Visualizer</h1>
          </div>
          
          {!parsedData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowHowToUse(true)}
              className="hover:bg-aws-orange hover:text-aws-darknavy text-aws-orange border-aws-orange/20"
            >
              <HelpCircleIcon className="h-4 w-4 mr-1" />
              How to Use
            </Button>
          )}
        </div>
      </header>

      {/* How to Use Dialog */}
      <Dialog open={showHowToUse} onOpenChange={setShowHowToUse}>
        <DialogContent className="bg-aws-navy border-aws-teal/30">
          <DialogHeader>
            <DialogTitle className="text-gradient-primary text-xl">How to Use AWS Connect Flow Visualizer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Search for your specific Contact ID in Cloud Watch.</li>
              <li>Export the logs as CSV including the following columns: timestamp & message.</li>
              <li>Then upload it here.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 flex flex-col">
        {!parsedData ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="max-w-lg w-full card-gradient p-8 rounded-lg shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex mb-6 p-3 rounded-full bg-aws-blue/10 text-aws-orange">
                  <UploadCloudIcon size={36} />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-gradient-primary">Upload Connect Log File</h2>
                <p className="text-muted-foreground">
                  Upload your AWS Connect log file (CSV format) to visualize the contact flow
                </p>
              </div>
              
              <FileUploader onDataParsed={handleParsedData} isLoading={isLoading} />
              
              {error && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/40 text-destructive rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileUpIcon className="h-5 w-5 text-aws-orange" />
                <h2 className="text-2xl font-bold text-gradient-primary">Contact Flow Visualization</h2>
              </div>
              <Button 
                onClick={() => setParsedData(null)} 
                variant="outline"
                className="hover:bg-aws-orange hover:text-aws-darknavy text-aws-orange border-aws-orange/20"
              >
                Upload New File
              </Button>
            </div>
            
            <div className="flex-1 glass-container rounded-lg overflow-hidden shadow-xl" style={{ height: '75vh' }}>
              <FlowVisualizer data={parsedData} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-aws-blue/20 py-3 backdrop-blur-sm bg-aws-darknavy/70">
        <div className="container mx-auto text-center text-muted-foreground text-xs">
          <p>AWS Connect Flow Visualizer | Built with React & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
