
import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle, Speaker, Code } from 'lucide-react';

interface ModuleNodeProps {
  data: {
    label: string;
    moduleType?: string;
    flowName?: string;
    parameters: Record<string, any>; 
    timestamp: string;
    results?: any;
  };
  isConnectable: boolean;
}

const ModuleNode = ({ data, isConnectable }: ModuleNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const [fullViewMode, setFullViewMode] = useState(false);
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const toggleFullView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullViewMode(!fullViewMode);
  };
  
  // Format timestamp with milliseconds
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };
  
  const formattedTime = data.timestamp ? formatTimestamp(data.timestamp) : 'Unknown time';
  
  const hasParameters = Object.keys(data.parameters).length > 0;
  
  // Check for error in results
  const hasError = data.results && 
    (typeof data.results === 'string' && data.results.includes("Error"));
  
  // If it's an error module, use a red background
  const nodeStyle = hasError ? "bg-red-500 text-white" : "";

  // Get module-specific icon
  const getModuleIcon = () => {
    const moduleName = data.label?.toLowerCase() || '';
    
    if (moduleName.includes('play prompt') || moduleName.includes('audio')) {
      return <Speaker className="h-4 w-4" />;
    } else if (moduleName.includes('lambda') || moduleName.includes('invoke')) {
      return <Code className="h-4 w-4" />;
    }
    
    return null;
  };

  // Format parameter value based on its type
  const formatParameterValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Format results value based on its type
  const formatResultsValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const nodeClasses = `node-content ${nodeStyle} ${fullViewMode ? 'expanded-node' : ''}`;
  const moduleIcon = getModuleIcon();

  return (
    <div className={nodeClasses}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: '#fff', border: '1px solid #555' }}
      />
      
      <div className="cursor-pointer">
        <div className="font-bold mb-1 flex items-center justify-between">
          <div className="flex items-center">
            {moduleIcon && <span className="mr-2">{moduleIcon}</span>}
            {data.label || 'Unknown Module'}
            {hasError && <AlertTriangle className="ml-2 text-white h-4 w-4" />}
          </div>
          {fullViewMode && (
            <span 
              className="text-xs cursor-pointer hover:underline"
              onClick={toggleFullView}
            >Click to minimize</span>
          )}
        </div>
        <div className="text-xs opacity-80 font-mono">{formattedTime}</div>
        
        {hasParameters && (
          <div className="mt-1">
            <div 
              className={`text-xs font-medium flex items-center justify-between ${hasError ? 'text-red-200' : ''} cursor-pointer`}
              onClick={toggleExpand}
            >
              <span>Parameters</span>
              <span>{expanded ? '▲' : '▼'}</span>
            </div>
            
            {(expanded || fullViewMode) && (
              <div className={`parameter-list mt-1 ${fullViewMode ? 'expanded-parameter-list' : ''}`}>
                {Object.entries(data.parameters).map(([key, value]) => (
                  <div key={key} className="parameter-item text-xs">
                    <span className="font-medium">{key}:</span>
                    <span className={`ml-1 opacity-90 ${fullViewMode ? 'break-all' : 'truncate'}`}>
                      {formatParameterValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {data.results && (expanded || fullViewMode) && (
          <div className={`mt-2 p-1 ${hasError ? 'bg-red-600 border-red-300' : 'bg-gray-100 border-gray-300'} rounded-sm border`}>
            <div className={`text-xs font-medium ${hasError ? 'text-white' : 'text-gray-800'}`}>
              {hasError ? 'Error:' : 'Results:'}
            </div>
            <div className={`text-xs ${hasError ? 'text-white' : 'text-gray-800'} ${fullViewMode ? 'whitespace-normal break-all max-h-40 overflow-y-auto' : 'truncate'}`}>
              {formatResultsValue(data.results)}
            </div>
          </div>
        )}

        {!fullViewMode && (
          <button
            className="w-full text-xs mt-2 px-2 py-1 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-sm transition-colors"
            onClick={toggleFullView}
          >
            Expand
          </button>
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
