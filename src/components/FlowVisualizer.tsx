import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowInstance,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  NodeProps,
} from 'reactflow';
import dagre from 'dagre';
import htmlToImage from 'html-to-image';
import download from 'downloadjs';

import 'reactflow/dist/style.css';
import { ParsedLogData, ContactFlowModule } from '@/types/log';
import ContactFlowTable from './ContactFlowTable';

interface FlowVisualizerProps {
  data: ParsedLogData | null;
}

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
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';

    // We are shifting the dagre node position (defined center ) to the top left
    // so it matches the React Flow node anchor point
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const ContactFlowNode = ({ data, selected }: NodeProps) => {
  return (
    <div className="react-flow__node-contactflow">
      <div>{data.label}</div>
    </div>
  );
};

const ModuleNode = ({ data, selected }: NodeProps) => {
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
                  <span>{value}</span>
                </div>
              ))}
            </div>
            {Object.keys(data.parameters).length > 3 && (
              <button onClick={toggleExpand} className="mt-2 text-sm">
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

const FlowVisualizer = ({ data }: FlowVisualizerProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (!data) return;

    const initialNodes: Node[] = data.modules.map((module) => ({
      id: module.id,
      data: { label: module.name, parameters: module.parameters },
      position: { x: 0, y: 0 },
      type: module.type === 'ContactFlowModule' ? 'module' : 'contactflow',
    }));

    const initialEdges: Edge[] = data.connections.map((connection) => ({
      id: `e-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data]);

  const exportAsJpg = useCallback(async () => {
    if (!reactFlowInstance) return;

    const image = await reactFlowInstance.toCanvas({
      x: 0,
      y: 0,
      width: 2000,
      height: 2000,
      // zoom: 1.5,
    });

    if (image) {
      download(image, 'contactflow.jpg', 'image/jpeg');
    }
  }, [reactFlowInstance]);

  return (
    <div className="flow-container">
      <div className="flow-controls flex justify-between items-center">
        <ContactFlowTable data={data} nodes={nodes} />
        <button
          onClick={exportAsJpg}
          className="ml-auto bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
        >
          <span>Export as JPG</span>
        </button>
      </div>
      
      <div className="flow-wrapper">
        {nodes.length > 0 && edges.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            onInit={(instance) => setReactFlowInstance(instance as ReactFlowInstance)}
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
