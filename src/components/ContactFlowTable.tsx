
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
  data: ParsedLogData;
  nodes: any[];
}

const ContactFlowTable = ({ data, nodes }: ContactFlowTableProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Extract unique contact flows
  const contactFlows: Array<{ id: string; name: string }> = [];
  data.contactFlows.forEach((name, id) => {
    contactFlows.push({ id, name });
  });
  
  // Count errors per flow
  const flowErrors = new Map<string, number>();
  
  nodes.forEach(node => {
    if (node.data.flowId && 
        node.data.results && 
        typeof node.data.results === 'string' && 
        node.data.results.includes('Error')) {
      const currentCount = flowErrors.get(node.data.flowId) || 0;
      flowErrors.set(node.data.flowId, currentCount + 1);
    }
  });

  return (
    <div className="contact-flow-table rounded-md border mb-4 bg-white">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="px-4 py-2 flex items-center justify-between border-b cursor-pointer hover:bg-gray-50">
            <div className="flex items-center">
              <TableIcon className="h-4 w-4 mr-2" />
              <h3 className="font-medium text-sm">
                Contact Flows ({contactFlows.length} flows, {nodes.length} blocks)
              </h3>
            </div>
            <div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="max-h-48 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Flow Name</TableHead>
                  <TableHead>Flow ID</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactFlows.map(flow => {
                  const errorCount = flowErrors.get(flow.id) || 0;
                  return (
                    <TableRow key={flow.id}>
                      <TableCell className="font-medium">{flow.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
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
                          <span className="text-sm text-green-600">None</span>
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
