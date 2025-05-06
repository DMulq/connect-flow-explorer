
import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Panel,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ParsedLogData } from '@/types/log';
import ContactFlowNode from './nodes/ContactFlowNode';
import ModuleNode from './nodes/ModuleNode';
import { Button } from '@/components/ui/button';

interface FlowVisualizerProps {
  data: ParsedLogData;
}

const nodeTypes = {
  contactflow: ContactFlowNode,
  module: ModuleNode,
};

const FlowVisualizer = ({ data }: FlowVisualizerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);
  
  // Filter options
  const [selectedContactId, setSelectedContactId] = useState<string>('all');
  
  const contactIds = useMemo(() => ['all', ...data.contactIds], [data.contactIds]);
  
  const filteredNodes = useMemo(() => {
    if (selectedContactId === 'all') {
      return nodes;
    }
    
    return nodes.filter(node => 
      node.data.contactId === selectedContactId || 
      node.type === 'contactflow'  // Always show flow nodes
    );
  }, [nodes, selectedContactId]);
  
  const filteredEdges = useMemo(() => {
    if (selectedContactId === 'all') {
      return edges;
    }
    
    // Get filtered node IDs for edge filtering
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    
    return edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
  }, [edges, filteredNodes, selectedContactId]);

  return (
    <ReactFlow
      nodes={filteredNodes}
      edges={filteredEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      attributionPosition="bottom-right"
    >
      <Panel position="top-left" className="bg-background p-3 rounded-md shadow-md">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Filter by Contact ID:</div>
          <select
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
            className="bg-background border border-border rounded-md p-1 text-sm"
          >
            {contactIds.map((id) => (
              <option key={id} value={id}>
                {id === 'all' ? 'All Contacts' : id.substring(0, 8) + '...'}
              </option>
            ))}
          </select>
          
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => {
              setNodes(data.nodes);
              setEdges(data.edges);
            }}
          >
            Reset Layout
          </Button>
        </div>
      </Panel>
      
      <Controls />
      <MiniMap nodeStrokeWidth={3} />
      <Background gap={16} color="#f1f1f1" />
    </ReactFlow>
  );
};

export default FlowVisualizer;
