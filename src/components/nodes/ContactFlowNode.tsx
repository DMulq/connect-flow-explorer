
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
      <div className="font-bold mb-1">{data.label || 'Unnamed Flow'}</div>
      {data.flowId && <div className="text-xs opacity-80 truncate">{data.flowId}</div>}
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: '#fff', border: '1px solid #555' }}
      />
    </>
  );
};

export default memo(ContactFlowNode);
