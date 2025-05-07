
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
  
  // Initialize nodes and edges on component mount with improved layout
  useEffect(() => {
    console.log("Setting up flow with:", data.nodes.length, "nodes and", data.edges.length, "edges");
    
    // Add horizontal distribution to node positions if they're stacked
    const enhancedNodes = data.nodes.map((node, index) => {
      // Skip contactflow nodes (headers)
      if (node.type === 'contactflow') {
        return node;
      }
      
      // Calculate horizontal position based on module index and depth
      const horizontalOffset = ((index % 3) * 320); // Distribute nodes horizontally
      const depthValue = node.data.depth !== undefined ? node.data.depth : 1;
      
      return {
        ...node,
        // Adjust position for better horizontal distribution
        position: {
          x: node.position.x + horizontalOffset,
          y: node.position.y + (depthValue * 100) // Increase vertical spacing based on depth
        }
      };
    });
    
    setNodes(enhancedNodes);
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
          <Alert variant="default" className="mb-3 bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-amber-600">Multiple Contact IDs Detected</AlertTitle>
            <AlertDescription className="text-amber-600">
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
          defaultViewport={{ x: 0, y: 0, zoom: 0.4 }} // Reduced zoom to show more of the flow
          fitViewOptions={{ 
            padding: 0.2, // Add padding around nodes when fitting view
            includeHiddenNodes: false
          }}
          nodesDraggable={true}
        >
          <Controls />
          <MiniMap 
            zoomable 
            pannable 
            nodeClassName={(node) => `node-${node.type}`}
            maskColor="rgba(240, 240, 240, 0.6)"
          />
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
