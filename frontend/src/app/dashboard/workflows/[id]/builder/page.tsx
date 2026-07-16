'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Panel,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

import { BuilderToolbar } from '@/components/builder/BuilderToolbar';
import { NodePanel } from '@/components/builder/NodePanel';
import { NodeConfigPanel } from '@/components/builder/NodeConfigPanel';
import { AIAssistantPanel } from '@/components/builder/AIAssistantPanel';
import { TriggerSelectionOverlay } from '@/components/builder/TriggerSelectionOverlay';
import { FlowNode } from '@/components/builder/nodes/FlowNode';
import { useBuilderStore } from '@/stores/builderStore';
import { apiClient } from '@/lib/api';
import { NODE_DEFINITIONS } from '@/lib/nodeDefinitions';

// Register custom node types
const nodeTypes = {
  flowNode: FlowNode,
};

// Default edge style
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: 'rgba(91,95,255,0.6)', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(91,95,255,0.6)' },
};

function WorkflowBuilderInner() {
  const params = useParams();
  const workflowId = params['id'] as string;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [nodePanelOpen, setNodePanelOpen] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState('Not saved yet');

  const { history, pushHistory, undo, redo, canUndo, canRedo } = useBuilderStore();

  const isLoadingRef = useRef(true);

  // Load workflow from database on mount
  useEffect(() => {
    if (!workflowId) return;

    async function loadWorkflow() {
      try {
        const response = await apiClient.get<any>(`/workflows/${workflowId}`);
        const canvasData = response.data?.canvasData || { nodes: [], edges: [] };
        
        isLoadingRef.current = true;
        setNodes((canvasData.nodes || []) as Node[]);
        setEdges((canvasData.edges || []) as Edge[]);
        setIsDirty(false);
        setLastSavedLabel('Loaded from database');
        
        // Wait a tick for React Flow to process elements before enabling dirty check
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 100);
      } catch (error) {
        console.error('Failed to load workflow:', error);
        setLastSavedLabel('Failed to load');
        isLoadingRef.current = false;
      }
    }

    void loadWorkflow();
  }, [workflowId, setNodes, setEdges]);

  const validationMessage = useMemo(() => {
    if (!nodes.length) return 'Add a trigger node to start';

    const hasTrigger = nodes.some((node) => ['webhookTrigger', 'scheduleTrigger', 'manualTrigger'].includes(String(node.data.nodeType)));
    if (!hasTrigger) return 'Add a trigger node';

    const missingConfig = nodes.filter((node) => {
      const def = NODE_DEFINITIONS[String(node.data.nodeType)];
      const config = (node.data.config ?? {}) as Record<string, unknown>;
      return def?.configSchema?.some((field) => field.required && (config[field.key] === undefined || config[field.key] === null || config[field.key] === ''));
    });

    if (missingConfig.length > 0) {
      return `${missingConfig.length} node${missingConfig.length > 1 ? 's' : ''} need${missingConfig.length === 1 ? 's' : ''} configuration`;
    }

    return null;
  }, [nodes]);

  const saveWorkflow = useCallback(async () => {
    if (!workflowId || !isDirty) return;

    setIsSaving(true);
    try {
      await apiClient.patch(`/workflows/${workflowId}`, {
        canvasData: { nodes, edges },
      });
      setLastSavedLabel(`Saved ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      setLastSavedLabel('Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, isDirty, nodes, edges]);

  useEffect(() => {
    if (!isDirty || !workflowId) return;
    const timer = window.setTimeout(() => {
      void saveWorkflow();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [isDirty, workflowId, saveWorkflow]);

  // Handle connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...connection, ...defaultEdgeOptions }, eds);
        setIsDirty(true);
        pushHistory({ nodes, edges: newEdges });
        return newEdges;
      });
    },
    [nodes, setEdges, pushHistory, edges]
  );

  // Drop node from panel
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/flowsphere-node-type');
      const nodeData = JSON.parse(event.dataTransfer.getData('application/flowsphere-node-data') || '{}');

      if (!nodeType || !reactFlowWrapper.current) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: 'flowNode',
        position,
        data: { ...nodeData, nodeType },
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        setIsDirty(true);
        pushHistory({ nodes: updated, edges });
        return updated;
      });
    },
    [screenToFlowPosition, setNodes, pushHistory, edges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (meta && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      if (meta && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') { setSelectedNode(null); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Handle trigger selection from overlay
  const onTriggerSelected = useCallback(
    (nodeType: string, label: string, description: string) => {
      const def = NODE_DEFINITIONS[nodeType];
      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: 'flowNode',
        position: { x: 250, y: 200 },
        data: {
          label: label || def?.label || 'Trigger',
          description: description || def?.description || '',
          nodeType,
          icon: def?.icon || '⚡',
          color: def?.color || '#5B5FFF',
          config: {},
        },
      };
      setNodes((nds) => {
        const updated = [...nds, newNode];
        setIsDirty(true);
        pushHistory({ nodes: updated, edges });
        return updated;
      });
    },
    [setNodes, pushHistory, edges]
  );

  // Handle adding nodes directly from click in Node Library
  const onAddNode = useCallback(
    (nodeType: string) => {
      const def = NODE_DEFINITIONS[nodeType];
      if (!def) return;

      const position = {
        x: 250 + (nodes.length * 30) % 150,
        y: 200 + (nodes.length * 30) % 150,
      };

      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: 'flowNode',
        position,
        data: {
          label: def.label,
          category: def.category,
          nodeType,
          config: {},
        },
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        setIsDirty(true);
        pushHistory({ nodes: updated, edges });
        return updated;
      });
    },
    [nodes.length, edges, setNodes, pushHistory]
  );

  // Build with AI handler
  const onBuildWithAI = useCallback(() => {
    setAiOpen(true);
  }, []);

  // Node click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const isEmptyCanvas = nodes.length === 0 && !isLoadingRef.current;

  return (
    <div className="flex h-full w-full">
      {/* Node library panel */}
      <AnimatePresence>
        {nodePanelOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-72 flex-shrink-0 border-r border-white/5 bg-surface-1 overflow-y-auto z-10"
          >
            <NodePanel onAddNode={onAddNode} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div ref={reactFlowWrapper} className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => { onNodesChange(changes); if (!isLoadingRef.current) setIsDirty(true); }}
          onEdgesChange={(changes) => { onEdgesChange(changes); if (!isLoadingRef.current) setIsDirty(true); }}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
          minZoom={0.2}
          maxZoom={2}
          className="canvas-bg"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="rgba(91,95,255,0.12)"
            gap={20}
            size={1}
          />
          <Controls className="bottom-6 left-6" showInteractive={false} />
          <MiniMap
            className="bottom-6 right-6"
            maskColor="rgba(9,13,22,0.8)"
            nodeColor="rgba(91,95,255,0.4)"
            style={{ width: 180, height: 110 }}
          />

          {/* Top toolbar inside canvas */}
          <Panel position="top-center" style={{ marginTop: '24px' }}>
            <BuilderToolbar
              workflowId={workflowId}
              isDirty={isDirty}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onToggleNodePanel={() => setNodePanelOpen(!nodePanelOpen)}
              nodePanelOpen={nodePanelOpen}
              onToggleAI={() => setAiOpen(!aiOpen)}
              aiOpen={aiOpen}
              isSaving={isSaving}
              lastSavedLabel={lastSavedLabel}
              validationMessage={validationMessage}
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
            />
          </Panel>
        </ReactFlow>

        {/* n8n-style trigger selection for empty workflows */}
        {isEmptyCanvas && (
          <TriggerSelectionOverlay
            onSelectTrigger={onTriggerSelected}
            onBuildWithAI={onBuildWithAI}
          />
        )}
      </div>

      {/* Node config panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-80 flex-shrink-0 border-l border-white/5 bg-surface-1 overflow-y-auto z-10"
          >
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onDelete={() => {
                setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
                setSelectedNode(null);
                setIsDirty(true);
              }}
              onUpdate={(updates) => {
                setNodes((nds) =>
                  nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...updates } } : n)
                );
                setIsDirty(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant panel */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-96 flex-shrink-0 border-l border-white/5 bg-surface-1 flex flex-col z-10"
          >
            <AIAssistantPanel
              workflowId={workflowId}
              onClose={() => setAiOpen(false)}
              onApplyWorkflow={(canvasData) => {
                setNodes(canvasData.nodes as Node[]);
                setEdges(canvasData.edges as Edge[]);
                setIsDirty(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
