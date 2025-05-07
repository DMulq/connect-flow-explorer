
import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ParsedLogData } from '@/types/log';
import ContactFlowNode from './nodes/ContactFlowNode';
import ModuleNode from './nodes/ModuleNode';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ContactFlowTable from './ContactFlowTable';

interface FlowVisualizerProps {
  data: ParsedLogData;
}

// Define custom node types
const nodeTypes = {
  contactflow: ContactFlowNode,
  module: ModuleNode,
};

// Define custom edge types and settings
const defaultEdgeOptions = {
  type: 'smoothstep',
  style: {
    strokeWidth: 2,
    stroke: '#a78bfa',
    borderRadius: 20,
  },
};

const SimpleFlow = ({ data }: FlowVisualizerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('all');
  const [multipleContactsDetected, setMultipleContactsDetected] = useState(false);
  
  // Initialize nodes and edges on component mount
  useEffect(() => {
    console.log("Setting up flow with:", data.nodes.length, "nodes and", data.edges.length, "edges");
    setNodes(data.nodes);
    setEdges(data.edges);
    
    // Check if multiple contacts are present
    setMultipleContactsDetected(data.contactIds.length > 1);
  }, [data, setNodes, setEdges]);

  // Filter nodes based on selected contact ID
  const filteredNodes = selectedContactId === 'all' 
    ? nodes 
    : nodes.filter(node => node.data.contactId === selectedContactId || node.type === 'contactflow');
  
  // Filter edges connected to visible nodes
  const filteredEdges = selectedContactId === 'all' 
    ? edges 
    : edges.filter(edge => {
        const sourceNode = filteredNodes.find(n => n.id === edge.source);
        const targetNode = filteredNodes.find(n => n.id === edge.target);
        return sourceNode && targetNode;
      });

  return (
    <div className="flow-container">
      <div className="flow-controls">
        <ContactFlowTable data={data} nodes={nodes} />
        
        {multipleContactsDetected && (
          <Alert variant="default" className="mb-3 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900">
            <AlertTitle className="text-amber-600 dark:text-amber-400">Multiple Contact IDs Detected</AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              Although multiple contacts are supported, this works best with just one contact ID.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Filter Contact:</span>
          <select
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
            className="bg-background border border-border rounded-md p-1 text-sm min-w-[350px]"
          >
            <option value="all">All Contacts</option>
            {data.contactIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNodes(data.nodes);
              setEdges(data.edges);
            }}
          >
            Reset View
          </Button>
        </div>
      </div>
      
      <div className="flow-wrapper">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Controls />
          <MiniMap zoomable pannable nodeClassName={(node) => `node-${node.type}`} />
          <Background gap={16} color="#f1f1f1" />
        </ReactFlow>
      </div>
    </div>
  );
};

const FlowVisualizer = ({ data }: FlowVisualizerProps) => {
  return (
    <div className="h-full w-full">
      <SimpleFlow data={data} />
    </div>
  );
};

export default FlowVisualizer;
