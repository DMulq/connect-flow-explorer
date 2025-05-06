
import { LogEntry, LogMessage, ParsedLogData, FlowNode, FlowEdge } from "@/types/log";

// Process raw log entries into structured data for visualization
export const processLogData = (entries: LogEntry[]): ParsedLogData => {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  const contactFlows = new Map<string, string>();
  const contactIds = new Set<string>();
  
  // Sort entries by timestamp
  const sortedEntries = [...entries].sort((a, b) => 
    parseInt(a.timestamp) - parseInt(b.timestamp)
  );
  
  // Keep track of the last module for each contact flow to create edges
  const lastModuleByContact: Record<string, string> = {};
  
  // Track the positions for each flow
  const flowPositions: Record<string, { x: number, y: number, moduleCount: number }> = {};
  
  let globalX = 100;
  const flowSpacing = 500;
  const moduleSpacing = 200;
  
  // Track created node IDs to ensure uniqueness
  const createdNodeIds = new Set<string>();
  
  // Process each log entry
  sortedEntries.forEach((entry) => {
    try {
      // Parse the JSON message
      const message: LogMessage = JSON.parse(entry.message);
      const contactId = message.ContactId;
      contactIds.add(contactId);
      
      // Add flow to the flows map if it's new
      if (!contactFlows.has(message.ContactFlowId)) {
        contactFlows.set(message.ContactFlowId, message.ContactFlowName);
        
        // Set position for this flow
        flowPositions[message.ContactFlowId] = { 
          x: globalX, 
          y: 100, 
          moduleCount: 0 
        };
        
        globalX += flowSpacing;
        
        // Add flow node
        const flowNodeId = `flow-${message.ContactFlowId}`;
        nodes.push({
          id: flowNodeId,
          type: 'contactflow',
          data: {
            label: message.ContactFlowName,
            flowId: message.ContactFlowId,
            timestamp: message.Timestamp,
            parameters: {},
            contactId
          },
          position: { 
            x: flowPositions[message.ContactFlowId].x, 
            y: flowPositions[message.ContactFlowId].y 
          }
        });
      }
      
      // Increment the module count for this flow
      flowPositions[message.ContactFlowId].moduleCount += 1;
      
      // Create a unique module node ID
      let moduleNodeId = `module-${message.Identifier}-${contactId}`;
      
      // If this ID was already created, make it unique
      if (createdNodeIds.has(moduleNodeId)) {
        moduleNodeId = `module-${message.Identifier}-${contactId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Add to created IDs set
      createdNodeIds.add(moduleNodeId);
      
      // Create module node
      nodes.push({
        id: moduleNodeId,
        type: 'module',
        data: {
          label: message.ContactFlowModuleType,
          moduleType: message.ContactFlowModuleType,
          flowName: message.ContactFlowName,
          flowId: message.ContactFlowId,
          timestamp: message.Timestamp,
          parameters: message.Parameters || {},
          contactId
        },
        position: { 
          x: flowPositions[message.ContactFlowId].x, 
          y: flowPositions[message.ContactFlowId].y + 
             (flowPositions[message.ContactFlowId].moduleCount * moduleSpacing) 
        }
      });
      
      // Connect module to its flow
      edges.push({
        id: `edge-flow-${message.ContactFlowId}-${moduleNodeId}`,
        source: `flow-${message.ContactFlowId}`,
        target: moduleNodeId,
        animated: false
      });
      
      // Connect module to previous module if in same contact
      if (lastModuleByContact[contactId]) {
        edges.push({
          id: `edge-${lastModuleByContact[contactId]}-${moduleNodeId}`,
          source: lastModuleByContact[contactId],
          target: moduleNodeId,
          animated: true,
          style: { stroke: '#a78bfa' }
        });
      }
      
      // Update the last module for this contact
      lastModuleByContact[contactId] = moduleNodeId;
      
    } catch (error) {
      console.error("Error processing log entry:", error);
    }
  });
  
  return {
    nodes,
    edges,
    contactFlows,
    contactIds: Array.from(contactIds)
  };
};
