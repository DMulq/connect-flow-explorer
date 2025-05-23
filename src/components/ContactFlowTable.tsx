
import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Table as TableIcon } from 'lucide-react';
import { ParsedLogData } from '@/types/log';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ContactFlowTableProps {
  data: ParsedLogData | null;
  nodes: any[];
}

const ContactFlowTable = ({ data, nodes }: ContactFlowTableProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!data) return null;

  // Extract unique contact flows
  const contactFlows: Array<{ id: string; name: string }> = [];
  data.contactFlows.forEach((name, id) => {
    contactFlows.push({ id, name });
  });
  
  // Count errors per flow
  const flowErrors = new Map<string, number>();
  
  nodes.forEach(node => {
    if (node.data?.flowId && 
        node.data?.results && 
        typeof node.data.results === 'string' && 
        node.data.results.includes('Error')) {
      const currentCount = flowErrors.get(node.data.flowId) || 0;
      flowErrors.set(node.data.flowId, currentCount + 1);
    }
  });
  
  // Calculate total errors
  const totalErrors = Array.from(flowErrors.values()).reduce((sum, count) => sum + count, 0);

  return (
    <div className="contact-flow-table w-full max-w-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="px-4 py-2 flex items-center justify-between rounded-t-md cursor-pointer bg-aws-darknavy hover:bg-aws-navy border border-aws-teal/30 text-white">
            <div className="flex items-center">
              <TableIcon className="h-4 w-4 mr-2 text-aws-teal" />
              <h3 className="font-medium text-sm">
                Contact Flows ({contactFlows.length} flows, {nodes.length} blocks, {totalErrors > 0 ? <span className="text-aws-orange">{totalErrors} errors</span> : '0 errors'})
              </h3>
            </div>
            <div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="max-h-48 overflow-y-auto bg-aws-navy/95 border-x border-b rounded-b-md border-aws-teal/30">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-aws-darknavy/80">
                  <TableHead className="w-[50%] text-aws-orange">Flow Name</TableHead>
                  <TableHead className="text-aws-teal">Flow ID</TableHead>
                  <TableHead className="text-right text-aws-orange">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactFlows.map(flow => {
                  const errorCount = flowErrors.get(flow.id) || 0;
                  return (
                    <TableRow key={flow.id} className="hover:bg-aws-darknavy/60 border-b border-aws-teal/10">
                      <TableCell className="font-medium text-white">{flow.name}</TableCell>
                      <TableCell className="text-xs text-aws-teal/80 truncate max-w-[200px]">
                        {flow.id}
                      </TableCell>
                      <TableCell className="text-right">
                        {errorCount > 0 ? (
                          <div className="flex items-center justify-end">
                            <div className="error-count">
                              {errorCount}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-green-500">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {contactFlows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No contact flows found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ContactFlowTable;
