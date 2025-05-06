import { LogEntry, LogMessage, ParsedLogData, FlowNode, FlowEdge } from "@/types/log";

// Process raw log entries into structured data for visualization
export const processLogData = (entries: LogEntry[]): ParsedLogData => {
  console.log("Processing log entries:", entries.length);
  
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
  
  // Simple horizontal layout
  let flowX = 200;
  const flowY = 100;
  const flowSpacing = 400;
  
  // Simple vertical layout for modules
  const moduleSpacing = 100;
  const moduleStartY = 200;
  
  // Track created node IDs to ensure uniqueness
  const createdNodeIds = new Set<string>();
  const moduleIdCounter: Record<string, number> = {};
  
  // Process each log entry to create nodes and edges
  sortedEntries.forEach((entry) => {
    try {
      // Parse the JSON message
      const message: LogMessage = JSON.parse(entry.message);
      const contactId = message.ContactId;
      contactIds.add(contactId);
      
      // Add flow to the flows map if it's new
      if (!contactFlows.has(message.ContactFlowId)) {
        contactFlows.set(message.ContactFlowId, message.ContactFlowName);
        
        // Create flow node
        const flowNodeId = `flow-${message.ContactFlowId}`;
        nodes.push({
          id: flowNodeId,
          type: 'contactflow',
          data: {
            label: message.ContactFlowName || "Unnamed Flow",
            flowId: message.ContactFlowId,
            timestamp: message.Timestamp,
            parameters: {},
            contactId
          },
          position: { x: flowX, y: flowY }
        });
        
        flowX += flowSpacing;
        
        // Initialize module counter for this flow
        moduleIdCounter[message.ContactFlowId] = 0;
      }
      
      // Increment module counter for this flow
      moduleIdCounter[message.ContactFlowId]++;
      
      // Create a truly unique module node ID
      const moduleCount = moduleIdCounter[message.ContactFlowId];
      const moduleNodeId = `module-${message.Identifier}-${moduleCount}`;
      
      // Simple vertical positioning for modules
      const moduleY = moduleStartY + (moduleCount * moduleSpacing);
      const moduleX = flowX - flowSpacing; // Position under its flow
      
      // Create module node
      nodes.push({
        id: moduleNodeId,
        type: 'module',
        data: {
          label: message.ContactFlowModuleType || "Unknown Module",
          moduleType: message.ContactFlowModuleType,
          flowName: message.ContactFlowName,
          flowId: message.ContactFlowId,
          timestamp: message.Timestamp,
          parameters: message.Parameters || {},
          contactId
        },
        position: { x: moduleX, y: moduleY }
      });
      
      // Connect module to its flow
      edges.push({
        id: `edge-flow-${message.ContactFlowId}-${moduleNodeId}`,
        source: `flow-${message.ContactFlowId}`,
        target: moduleNodeId,
        animated: false,
        type: 'smoothstep'
      });
      
      // Connect module to previous module if in same contact and flow
      if (lastModuleByContact[contactId]) {
        edges.push({
          id: `edge-${lastModuleByContact[contactId]}-${moduleNodeId}`,
          source: lastModuleByContact[contactId],
          target: moduleNodeId,
          animated: true,
          type: 'smoothstep',
          style: { stroke: '#a78bfa' }
        });
      }
      
      // Update the last module for this contact
      lastModuleByContact[contactId] = moduleNodeId;
      
    } catch (error) {
      console.error("Error processing log entry:", error);
    }
  });
  
  console.log("Processed into:", nodes.length, "nodes,", edges.length, "edges");
  
  return {
    nodes,
    edges,
    contactFlows,
    contactIds: Array.from(contactIds)
  };
};
