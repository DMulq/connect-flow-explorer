
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface ContactFlowNodeProps {
  data: {
    label: string;
    flowId?: string;
    timestamp?: string;
  };
  isConnectable: boolean;
}

const ContactFlowNode = ({ data, isConnectable }: ContactFlowNodeProps) => {
  return (
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
      
      <div className="font-bold mb-1">{data.label}</div>
      <div className="text-xs opacity-80 truncate">{data.flowId}</div>
    </>
  );
};

export default memo(ContactFlowNode);
