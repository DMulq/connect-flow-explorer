
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  MiniMap, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  NodeProps,
  ReactFlowInstance,
  Position,
  OnInit,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

import { ParsedLogData } from '@/types/log';
import ContactFlowTable from './ContactFlowTable';

interface FlowVisualizerProps {
  data: ParsedLogData | null;
}

// Set up the dagre graph
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 50;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? Position.Top : Position.Left;
    node.sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right;

    // We are shifting the dagre node position (defined center) to the top left
    // so it matches the React Flow node anchor point
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const ContactFlowNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="react-flow__node-contactflow">
      <div>{data.label}</div>
    </div>
  );
};

const ModuleNode: React.FC<NodeProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="react-flow__node-module">
      <div className={`node-content ${expanded ? 'expanded-node' : ''}`}>
        <h4 className="font-bold">{data.label}</h4>
        {data.parameters && Object.keys(data.parameters).length > 0 && (
          <>
            <h5 className="font-medium mt-2">Parameters:</h5>
            <div className={`parameter-list ${expanded ? 'expanded-parameter-list' : ''}`}>
              {Object.entries(data.parameters).map(([key, value]) => (
                <div key={key} className="parameter-item">
                  <span className="font-medium">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
            {Object.keys(data.parameters).length > 3 && (
              <button onClick={toggleExpand} className="mt-2 text-xs px-2 py-1 rounded bg-aws-blue/30 hover:bg-aws-blue/50 text-white transition-colors">
                {expanded ? 'Collapse' : 'Expand'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  contactflow: ContactFlowNode,
  module: ModuleNode,
};

const FlowVisualizer: React.FC<FlowVisualizerProps> = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    const initialNodes: Node[] = data.nodes.map((node) => ({
      id: node.id,
      data: { 
        label: node.data.label || node.id, 
        parameters: node.data.parameters || {} 
      },
      position: { x: 0, y: 0 },
      type: node.type === 'module' ? 'module' : 'contactflow',
    }));

    const initialEdges: Edge[] = data.edges.map((edge, index) => ({
      id: `e-${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      animated: true,
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges]);

  const exportAsImage = useCallback(async () => {
    if (!reactFlowInstance) return;

    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    try {
      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#161E2D',
        width: flowElement.clientWidth * 2,
        height: flowElement.clientHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
        },
      });
      saveAs(dataUrl, 'aws-connect-flow.png');
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  }, [reactFlowInstance]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onInit: OnInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
    },
    []
  );

  return (
    <div className="flow-container">
      <div className="flow-controls flex justify-between items-center">
        <ContactFlowTable data={data} nodes={nodes} />
        <button
          onClick={exportAsImage}
          className="ml-auto bg-aws-orange hover:bg-aws-orange/80 text-aws-navy font-medium px-4 py-2 rounded transition-colors flex items-center space-x-2"
        >
          <span>Export as PNG</span>
        </button>
      </div>
      
      <div className="flow-wrapper">
        {nodes.length > 0 && edges.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            onInit={onInit}
            proOptions={{ hideAttribution: true }}
          >
            <Controls className="react-flow__controls" />
            <MiniMap zoomable pannable nodeColor={(node) => node.type === 'module' ? '#00A1C9' : '#0073BB'} />
            <Background color="#6b7280" gap={16} size={1} />
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
