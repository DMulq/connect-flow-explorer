
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
  
  // Track last module per flow to create sequential edges
  const lastModuleByFlow: Record<string, string> = {};
  
  // Track module count per flow for vertical positioning
  const moduleCountByFlow: Record<string, number> = {};
  
  // Track flow index for horizontal positioning
  let flowIndex = 0;
  const flowPositions: Record<string, number> = {};
  
  // Layout constants
  const flowSpacing = 350;
  const moduleSpacing = 180;
  const startX = 100;
  const flowY = 50;
  const moduleStartY = 180;
  
  // Process each log entry to create nodes and edges
  sortedEntries.forEach((entry) => {
    try {
      // Parse the JSON message
      const message: LogMessage = JSON.parse(entry.message);
      const contactId = message.ContactId;
      const flowId = message.ContactFlowId;
      contactIds.add(contactId);
      
      // Add flow to the flows map if it's new
      if (!contactFlows.has(flowId)) {
        contactFlows.set(flowId, message.ContactFlowName);
        
        // Store flow's X position
        flowPositions[flowId] = startX + (flowIndex * flowSpacing);
        
        // Create flow node at the top
        const flowNodeId = `flow-${flowId}`;
        nodes.push({
          id: flowNodeId,
          type: 'contactflow',
          data: {
            label: message.ContactFlowName || "Unnamed Flow",
            flowId: flowId,
            timestamp: message.Timestamp,
            parameters: {},
            contactId
          },
          position: { x: flowPositions[flowId], y: flowY }
        });
        
        flowIndex++;
        moduleCountByFlow[flowId] = 0;
      }
      
      // Increment module counter for this flow
      moduleCountByFlow[flowId]++;
      const moduleCount = moduleCountByFlow[flowId];
      
      // Create unique module node ID
      const moduleNodeId = `module-${flowId}-${moduleCount}`;
      
      // Position module directly below its flow
      const moduleX = flowPositions[flowId];
      const moduleY = moduleStartY + ((moduleCount - 1) * moduleSpacing);
      
      // Create module node
      nodes.push({
        id: moduleNodeId,
        type: 'module',
        data: {
          label: message.ContactFlowModuleType || "Unknown Module",
          moduleType: message.ContactFlowModuleType,
          flowName: message.ContactFlowName,
          flowId: flowId,
          timestamp: message.Timestamp,
          parameters: message.Parameters || {},
          results: message.Results,
          contactId
        },
        position: { x: moduleX, y: moduleY }
      });
      
      // Connect to previous node in this flow (flow header or previous module)
      const sourceId = lastModuleByFlow[flowId] || `flow-${flowId}`;
      edges.push({
        id: `edge-${sourceId}-${moduleNodeId}`,
        source: sourceId,
        target: moduleNodeId,
        animated: false,
        type: 'smoothstep',
        style: { 
          stroke: '#3b82f6', 
          strokeWidth: 2
        }
      });
      
      // Update last module for this flow
      lastModuleByFlow[flowId] = moduleNodeId;
      
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
