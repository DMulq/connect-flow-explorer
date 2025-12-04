
import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  Node,
  Edge,
  NodeProps,
  ReactFlowInstance,
  Position,
  Handle,
  MarkerType
} from '@xyflow/react';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

import '@xyflow/react/dist/style.css';
import { ParsedLogData } from '@/types/log';
import ContactFlowTable from './ContactFlowTable';

const nodeWidth = 200;
const nodeHeight = 50;

// Use positions from data directly, just add source/target positions for handles
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
  const layoutedNodes = nodes.map((node) => ({
    ...node,
    targetPosition: direction === 'TB' ? Position.Top : Position.Left,
    sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
  }));

  // Add arrow markers to edges
  const layoutedEdges = edges.map((edge) => ({
    ...edge,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#3b82f6',
    },
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

const ContactFlowNode = ({ data }: NodeProps) => {
  return (
    <div className="react-flow__node-contactflow">
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <div>{String(data.label)}</div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
};

const ModuleNode = ({ data }: NodeProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const parameters = data.parameters as Record<string, unknown> | undefined;

  return (
    <div className={`react-flow__node-module ${expanded ? 'expanded' : ''}`}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <div className="node-content">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-sm">{String(data.label)}</h4>
          <button 
            onClick={toggleExpand} 
            className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded ml-2"
          >
            {expanded ? '−' : '+'}
          </button>
        </div>
        {parameters && Object.keys(parameters).length > 0 && (
          <>
            <h5 className="font-medium mt-2 text-xs text-muted-foreground">Parameters:</h5>
            <div className={`parameter-list ${expanded ? 'expanded-parameter-list' : ''}`}>
              {Object.entries(parameters).map(([key, value]) => (
                <div key={key} className="parameter-item">
                  <span className="font-medium">{key}:</span>
                  <span className="break-all">{String(value)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
};


const nodeTypes = {
  contactflow: ContactFlowNode,
  module: ModuleNode,
};

interface FlowVisualizerProps {
  data: ParsedLogData | null;
}

const FlowVisualizer = ({ data }: FlowVisualizerProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    const initialNodes: Node[] = data.nodes.map((node) => ({
      id: node.id,
      data: {
        label: node.data.label || "Unnamed Module",
        parameters: node.data.parameters || {},
      },
      position: node.position || { x: 0, y: 0 },
      type: node.type === 'module' ? 'module' : 'contactflow',
    }));

    const initialEdges: Edge[] = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
      style: edge.style,
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      'TB'
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data]);

  const exportAsPng = useCallback(async () => {
    if (!reactFlowInstance) return;

    const flowContainer = document.querySelector('.react-flow') as HTMLElement;
    if (!flowContainer) return;

    try {
      const dataUrl = await toPng(flowContainer, {
        backgroundColor: '#ffffff',
        width: 1920,
        height: 1080,
        skipFonts: true,
      });
      
      saveAs(dataUrl, 'contact-flow-visualization.png');
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  }, [reactFlowInstance]);

  return (
    <div className="flow-container">
      <div className="flow-controls mb-4">
        <ContactFlowTable data={data} nodes={nodes} />
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={exportAsPng} 
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
          >
            <span>Export as PNG</span>
          </button>
        </div>
      </div>
      
      <div className="flow-wrapper bg-background border border-border rounded-md overflow-hidden" style={{ height: '70vh' }}>
        {nodes.length > 0 || edges.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            onInit={(instance) => setReactFlowInstance(instance as ReactFlowInstance)}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#3b82f6', strokeWidth: 2 },
            }}
          >
            <Controls />
            <MiniMap zoomable pannable nodeClassName={(node) => `node-${node.type}`} />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Processing data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowVisualizer;
