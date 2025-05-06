
import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

interface ModuleNodeProps {
  data: {
    label: string;
    moduleType?: string;
    flowName?: string;
    parameters: Record<string, string>;
    timestamp: string;
    results?: string;
  };
  isConnectable: boolean;
}

const ModuleNode = ({ data, isConnectable }: ModuleNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Format timestamp if available
  const formattedTime = data.timestamp ? 
    new Date(data.timestamp).toLocaleTimeString() : 'Unknown time';
  
  const hasParameters = Object.keys(data.parameters).length > 0;
  
  // Check for error in results
  const hasError = data.results && data.results.includes("Error");
  
  // If it's an error module, use a red background
  const nodeStyle = hasError ? "bg-red-500 text-white" : "";

  return (
    <div className={`node-content ${nodeStyle}`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#fff', border: '1px solid #555' }}
      />
      
      <div onClick={toggleExpand} className="cursor-pointer">
        <div className="font-bold mb-1 flex items-center">
          {data.label || 'Unknown Module'}
          {hasError && <AlertTriangle className="ml-2 text-white h-4 w-4" />}
        </div>
        <div className="text-xs opacity-80">{formattedTime}</div>
        
        {hasParameters && (
          <div className="mt-1">
            <div className={`text-xs font-medium flex items-center justify-between ${hasError ? 'text-red-200' : ''}`}>
              <span>Parameters</span>
              <span>{expanded ? '▲' : '▼'}</span>
            </div>
            
            {expanded && (
              <div className="parameter-list mt-1">
                {Object.entries(data.parameters).map(([key, value]) => (
                  <div key={key} className="parameter-item text-xs">
                    <span className="font-medium">{key}:</span>
                    <span className="ml-1 opacity-90 truncate">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {hasError && expanded && (
          <div className="mt-2 p-1 bg-red-600 border border-red-300 rounded-sm">
            <div className="text-xs font-medium text-white">Error:</div>
            <div className="text-xs text-white">{data.results}</div>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#fff', border: '1px solid #555' }}
      />
    </div>
  );
};

export default memo(ModuleNode);
