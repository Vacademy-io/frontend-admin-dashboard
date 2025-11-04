import { useState, useRef, useEffect } from 'react';
import { AutomationDiagram, NodeType, WorkflowNode } from '@/types/workflow/workflow-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Minus, Plus, ArrowsOut } from 'phosphor-react';

interface WorkflowDiagramSimpleProps {
    diagram: AutomationDiagram;
}

const getNodeTypeColor = (type: NodeType): string => {
    const colors = {
        TRIGGER: 'border-green-500 bg-green-50 hover:bg-green-100',
        ACTION: 'border-blue-500 bg-blue-50 hover:bg-blue-100',
        DECISION: 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100',
        EMAIL: 'border-purple-500 bg-purple-50 hover:bg-purple-100',
        NOTIFICATION: 'border-indigo-500 bg-indigo-50 hover:bg-indigo-100',
        DATABASE: 'border-red-500 bg-red-50 hover:bg-red-100',
        WEBHOOK: 'border-orange-500 bg-orange-50 hover:bg-orange-100',
        UNKNOWN: 'border-gray-500 bg-gray-50 hover:bg-gray-100',
    };
    return colors[type] || colors.UNKNOWN;
};

const getNodeBadgeColor = (type: NodeType): string => {
    const colors = {
        TRIGGER: 'bg-green-100 text-green-800 border-green-500',
        ACTION: 'bg-blue-100 text-blue-800 border-blue-500',
        DECISION: 'bg-yellow-100 text-yellow-800 border-yellow-500',
        EMAIL: 'bg-purple-100 text-purple-800 border-purple-500',
        NOTIFICATION: 'bg-indigo-100 text-indigo-800 border-indigo-500',
        DATABASE: 'bg-red-100 text-red-800 border-red-500',
        WEBHOOK: 'bg-orange-100 text-orange-800 border-orange-500',
        UNKNOWN: 'bg-gray-100 text-gray-800 border-gray-500',
    };
    return colors[type] || colors.UNKNOWN;
};

const getNodeIcon = (type: NodeType): string => {
    const icons = {
        TRIGGER: '⚡',
        ACTION: '⚙️',
        DECISION: '🔀',
        EMAIL: '📧',
        NOTIFICATION: '🔔',
        DATABASE: '💾',
        WEBHOOK: '🔗',
        UNKNOWN: '❓',
    };
    return icons[type] || icons.UNKNOWN;
};

export function WorkflowDiagramSimple({ diagram }: WorkflowDiagramSimpleProps) {
    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Debug: Log edge information
    useEffect(() => {
        console.log('📊 Workflow Diagram Debug:');
        console.log(`Total Nodes: ${diagram.nodes.length}`);
        console.log(`Total Edges: ${diagram.edges.length}`);
        console.log('Edges:', diagram.edges);
        console.log('Nodes:', diagram.nodes.map((n) => ({ id: n.id, title: n.title })));
    }, [diagram]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
            // Left mouse button
            setIsPanning(true);
            setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPan({
                x: e.clientX - startPan.x,
                y: e.clientY - startPan.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.1, 2));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.1, 0.5));
    };

    const handleResetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    if (!diagram || diagram.nodes.length === 0) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50">
                <p className="text-lg font-medium text-neutral-500">
                    No workflow diagram available
                </p>
                <p className="text-sm text-neutral-400">
                    This workflow may not have any configured nodes
                </p>
            </div>
        );
    }

    // Create a map of edges for connections
    const edgeMap = new Map<string, { targetId: string; label: string }[]>();
    diagram.edges.forEach((edge) => {
        if (!edgeMap.has(edge.sourceNodeId)) {
            edgeMap.set(edge.sourceNodeId, []);
        }
        edgeMap.get(edge.sourceNodeId)!.push({
            targetId: edge.targetNodeId,
            label: edge.label,
        });
    });

    // Calculate positions for horizontal layout
    const nodeWidth = 280;
    const nodeHeight = 150;
    const horizontalGap = 200;
    const verticalGap = 50;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-800">Automation Diagram</h2>
                    <p className="text-sm text-neutral-600">
                        {diagram.nodes.length} node{diagram.nodes.length !== 1 ? 's' : ''},{' '}
                        {diagram.edges.length} connection{diagram.edges.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                        <Minus size={16} weight="bold" />
                    </Button>
                    <span className="text-sm font-medium text-neutral-600">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                        <Plus size={16} weight="bold" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetView}>
                        <ArrowsOut size={16} weight="bold" />
                    </Button>
                </div>
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="relative h-[600px] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg
                    className="pointer-events-none absolute left-0 top-0"
                    width={diagram.nodes.length * (nodeWidth + horizontalGap) + 100}
                    height="800"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                    }}
                >
                    {/* Background grid pattern */}
                    <defs>
                        <pattern
                            id="grid"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="1" cy="1" r="1" fill="#e5e7eb" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Draw connections */}
                    {diagram.edges.map((edge, edgeIndex) => {
                        const sourceIndex = diagram.nodes.findIndex((n) => n.id === edge.sourceNodeId);
                        const targetIndex = diagram.nodes.findIndex((n) => n.id === edge.targetNodeId);

                        if (sourceIndex === -1 || targetIndex === -1) {
                            console.warn('Edge with missing node:', edge);
                            return null;
                        }

                        const sourceX = 50 + sourceIndex * (nodeWidth + horizontalGap) + nodeWidth;
                        const sourceY = 50 + nodeHeight / 2;
                        const targetX = 50 + targetIndex * (nodeWidth + horizontalGap);
                        const targetY = 50 + nodeHeight / 2;

                        const midX = (sourceX + targetX) / 2;

                        // Add some vertical offset if source and target are the same Y position
                        const yOffset = Math.abs(targetIndex - sourceIndex) > 3 ? 30 : 0;

                        return (
                            <g key={`${edge.id}-${edgeIndex}`}>
                                {/* Curved path */}
                                <path
                                    d={`M ${sourceX} ${sourceY} C ${midX} ${sourceY + yOffset}, ${midX} ${targetY + yOffset}, ${targetX} ${targetY}`}
                                    stroke="#94a3b8"
                                    strokeWidth="2"
                                    fill="none"
                                    markerEnd="url(#arrowhead)"
                                    style={{ pointerEvents: 'none' }}
                                />
                                {/* Label background */}
                                <rect
                                    x={midX - 30}
                                    y={sourceY + yOffset - 18}
                                    width="60"
                                    height="16"
                                    fill="white"
                                    rx="4"
                                    opacity="0.9"
                                />
                                {/* Label */}
                                <text
                                    x={midX}
                                    y={sourceY + yOffset - 8}
                                    textAnchor="middle"
                                    fill="#475569"
                                    fontSize="11"
                                    fontWeight="500"
                                    className="pointer-events-none"
                                >
                                    {edge.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Arrow marker definition */}
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                        </marker>
                    </defs>
                </svg>

                {/* Nodes */}
                <div
                    className="absolute left-0 top-0"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        width: `${diagram.nodes.length * (nodeWidth + horizontalGap) + 100}px`,
                        height: '800px',
                    }}
                >
                    {diagram.nodes.map((node, index) => {
                        const x = 50 + index * (nodeWidth + horizontalGap);
                        const y = 50;

                        return (
                            <div
                                key={node.id}
                                className={cn(
                                    'absolute cursor-pointer rounded-lg border-2 p-4 shadow-md transition-all hover:shadow-lg',
                                    getNodeTypeColor(node.type)
                                )}
                                style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    width: `${nodeWidth}px`,
                                    minHeight: `${nodeHeight}px`,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNode(node);
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{getNodeIcon(node.type)}</span>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-neutral-900">
                                            {node.title}
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className="mt-1 text-xs"
                                        >
                                            {node.type}
                                        </Badge>
                                        {node.description && (
                                            <p className="mt-2 line-clamp-3 text-xs text-neutral-600">
                                                {node.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs text-neutral-600">
                    <strong>💡 Tip:</strong> Click and drag to pan around the diagram. Use the zoom
                    controls to zoom in/out. Click on any node to view its details.
                </p>
            </div>

            {/* Debug Info - Remove this after testing */}
            {process.env.NODE_ENV === 'development' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-xs font-mono text-blue-900">
                        <strong>Debug:</strong> Rendering {diagram.edges.length} edges. Open
                        console to see edge details.
                    </p>
                </div>
            )}

            {/* Node Details Modal */}
            <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <span className="text-2xl">
                                {selectedNode && getNodeIcon(selectedNode.type)}
                            </span>
                            {selectedNode?.title}
                            {selectedNode && (
                                <Badge className={getNodeBadgeColor(selectedNode.type)}>
                                    {selectedNode.type}
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedNode && (
                        <div className="space-y-4">
                            {selectedNode.description && (
                                <div>
                                    <span className="text-sm font-medium text-neutral-700">
                                        Description:
                                    </span>
                                    <p className="mt-1 text-sm text-neutral-600">
                                        {selectedNode.description}
                                    </p>
                                </div>
                            )}

                            {selectedNode.details &&
                                Object.keys(selectedNode.details).length > 0 && (
                                    <div>
                                        <span className="text-sm font-medium text-neutral-700">
                                            Configuration Details:
                                        </span>
                                        <div className="mt-2 max-h-96 space-y-2 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                            {Object.entries(selectedNode.details).map(
                                                ([key, value]) => (
                                                    <div key={key} className="space-y-1">
                                                        <p className="text-sm font-medium text-neutral-700">
                                                            {key}:
                                                        </p>
                                                        <pre className="overflow-auto whitespace-pre-wrap break-words rounded bg-white p-2 text-xs text-neutral-600">
                                                            {typeof value === 'object'
                                                                ? JSON.stringify(value, null, 2)
                                                                : String(value)}
                                                        </pre>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
