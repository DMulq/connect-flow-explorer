
// Raw log entry from the CSV file
export interface LogEntry {
  timestamp: string;
  message: string;
  logStreamName: string;
}

// Parsed message content
export interface LogMessage {
  ContactId: string;
  ContactFlowId: string;
  ContactFlowName: string;
  ContactFlowModuleType: string;
  Identifier: string;
  Timestamp: string;
  Parameters: Record<string, string>;
  Results?: string;
}

// Node for visualization
export interface FlowNode {
  id: string;
  type: 'contactflow' | 'module';
  data: {
    label: string;
    moduleType?: string;
    flowName?: string;
    flowId?: string;
    timestamp: string;
    parameters: Record<string, string>;
    contactId: string;
    results?: string;
  };
  position: { x: number, y: number };
}

// Edge for visualization
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  label?: string;
  style?: Record<string, string | number>;
}

// Processed data ready for visualization
export interface ParsedLogData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  contactFlows: Map<string, string>; // flowId -> flowName
  contactIds: string[];
}
