import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position
} from '@xyflow/react';
import type { Connection, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, Database, Cpu, Brain, BatteryCharging, Flag, GitCommit, ChevronRight } from 'lucide-react';

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className={`px-4 py-3 shadow-md rounded-none border-2 bg-card ${data.active ? 'border-primary' : 'border-border'} w-[200px]`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 rounded-none bg-primary border-none" />
      <div className="flex items-center gap-3 mb-2">
        {data.icon}
        <div className="font-black text-sm tracking-widest text-foreground">{data.label}</div>
      </div>
      <div className="text-xs font-mono text-muted-foreground">{data.sub}</div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 rounded-none bg-primary border-none" />
    </div>
  );
};

const DecisionNode = ({ data }: { data: any }) => {
  return (
    <div className={`px-4 py-3 shadow-md rounded-none border-2 border-primary bg-primary/10 w-[240px]`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 rounded-none bg-primary border-none" />
      <div className="flex items-center gap-3 mb-3 border-b border-primary/30 pb-2">
        <GitCommit className="text-primary" size={18} />
        <div className="font-black text-sm tracking-widest text-primary">{data.label}</div>
      </div>
      <div className="flex flex-col gap-2 font-mono text-xs">
        <div className="flex items-center justify-between"><span className="text-foreground">DEPLOY</span> <ChevronRight size={14} className="text-primary"/></div>
        <div className="flex items-center justify-between"><span className="text-foreground">HOLD</span> <ChevronRight size={14} className="text-primary"/></div>
        <div className="flex items-center justify-between"><span className="text-foreground">HARVEST</span> <ChevronRight size={14} className="text-primary"/></div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 rounded-none bg-primary border-none" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
  decision: DecisionNode
};

export const Architecture = ({ onBack }: { onBack: () => void }) => {
  const initialNodes = [
    { id: '1', type: 'custom', position: { x: 50, y: 150 }, data: { label: 'INGEST', sub: 'Telemetry API', icon: <Database size={18} className="text-muted-foreground" /> } },
    { id: '2', type: 'custom', position: { x: 300, y: 150 }, data: { label: 'MODEL', sub: 'Physics Engine', icon: <Cpu size={18} className="text-muted-foreground" /> } },
    { id: '3', type: 'custom', position: { x: 550, y: 150 }, data: { label: 'SIMULATE', sub: 'Race Trajectory', icon: <Activity size={18} className="text-muted-foreground" /> } },
    { id: '4', type: 'custom', position: { x: 800, y: 150 }, data: { label: 'OPTIMIZE', sub: 'AI Strategy', icon: <Brain size={18} className="text-muted-foreground" /> } },
    { id: '5', type: 'decision', position: { x: 1100, y: 120 }, data: { label: 'DECISION' } },
    { id: '6', type: 'custom', position: { x: 1450, y: 150 }, data: { label: 'PITWALL', sub: 'Alert & Act', icon: <Flag size={18} className="text-muted-foreground" />, active: true } },
  ];

  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#e6002b', strokeWidth: 2 } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#e6002b', strokeWidth: 2 } },
    { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#e6002b', strokeWidth: 2 } },
    { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#e6002b', strokeWidth: 2 } },
    { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#e6002b', strokeWidth: 2 } },
    { id: 'e6-2', source: '6', target: '2', type: 'step', sourceHandle: 'bottom', targetHandle: 'bottom', label: 'FEEDBACK LOOP', labelStyle: { fill: '#fff', fontFamily: 'monospace', fontSize: 10 }, animated: true, style: { stroke: '#666', strokeWidth: 1, strokeDasharray: '5 5' } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border p-6 flex justify-between items-center bg-card z-10">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-4">
            TRACKSHIFT 2026
          </h1>
          <p className="text-primary font-mono text-sm tracking-widest mt-1">
            TACTICAL EXECUTION INTERFACE
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block mr-8">
            <div className="text-xs font-mono text-muted-foreground">CONFIDENTIAL</div>
            <div className="font-bold tracking-widest">HAAS F1 × PLAKSHA</div>
          </div>
          <button 
            onClick={onBack}
            className="border border-border hover:border-primary text-foreground font-mono text-xs px-4 py-2 transition-colors uppercase tracking-widest bg-background"
          >
            ← BACK TO DASHBOARD
          </button>
        </div>
      </header>

      <div className="flex-1 w-full relative bg-[#050505]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="dark"
        >
          <Background color="#222" gap={20} size={1} />
          <Controls className="bg-card border-border fill-foreground" />
        </ReactFlow>
        
        {/* Bottom Metrics Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8 z-10">
          <div className="bg-card/90 backdrop-blur border border-border p-6 text-center w-[220px]">
             <div className="text-4xl font-black text-foreground mb-2">98</div>
             <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">PERFORMANCE SCORE</div>
          </div>
          <div className="bg-card/90 backdrop-blur border border-primary p-6 text-center w-[220px] shadow-[0_0_15px_rgba(230,0,43,0.15)]">
             <div className="text-4xl font-black text-foreground mb-2">2.82<span className="text-xl text-muted-foreground ml-1">MJ</span></div>
             <div className="text-xs font-mono text-primary uppercase tracking-widest">MINIMUM SOC</div>
          </div>
          <div className="bg-card/90 backdrop-blur border border-border p-6 text-center w-[220px]">
             <div className="text-4xl font-black text-foreground mb-2">0.0<span className="text-xl text-muted-foreground ml-1">s</span></div>
             <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">BLACKOUT EXPOSURE</div>
          </div>
        </div>
      </div>
    </div>
  );
};
