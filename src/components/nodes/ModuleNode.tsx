
import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

interface ModuleNodeProps {
  data: {
    label: string;
    moduleType?: string;
    flowName?: string;
    parameters: Record<string, string>;
    timestamp: string;
  };
  isConnectable: boolean;
}

const ModuleNode = ({ data, isConnectable }: ModuleNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const formattedDate = new Date(data.timestamp).toLocaleTimeString();
  
  const hasParameters = Object.keys(data.parameters).length > 0;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div onClick={toggleExpand} className="cursor-pointer">
        <div className="font-bold mb-1">{data.label}</div>
        <div className="text-xs opacity-80">{formattedDate}</div>
        
        {hasParameters && (
          <div className="mt-2">
            <div className="text-xs font-medium mb-1 flex items-center justify-between">
              <span>Parameters</span>
              <span className="opacity-70">{expanded ? '▲' : '▼'}</span>
            </div>
            
            {expanded && (
              <div className="parameter-list">
                {Object.entries(data.parameters).map(([key, value]) => (
                  <div key={key} className="parameter-item text-xs">
                    <span className="font-medium">{key}:</span>
                    <span className="ml-1 truncate">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default memo(ModuleNode);
