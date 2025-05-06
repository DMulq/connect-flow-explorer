
import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

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
  
  // Apply error styling if results indicate an error
  const nodeStyle = hasError ? 
    "border-2 border-red-600 bg-red-100" : 
    "";

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
          {hasError && <span className="ml-2 text-red-600 text-sm">⚠️</span>}
        </div>
        <div className="text-xs opacity-80">{formattedTime}</div>
        
        {hasParameters && (
          <div className="mt-1">
            <div className="text-xs font-medium flex items-center justify-between">
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
          <div className="mt-2 p-1 bg-red-100 border border-red-300 rounded-sm">
            <div className="text-xs font-medium text-red-700">Error:</div>
            <div className="text-xs text-red-600">{data.results}</div>
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
