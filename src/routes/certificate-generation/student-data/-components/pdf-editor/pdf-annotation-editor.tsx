import { useEffect, useRef, useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ImageTemplate, FieldMapping, AvailableField } from '@/types/certificate/certificate-types';
import { MyButton } from '@/components/design-system/button';
import { Eye, Gear, FloppyDisk, Trash, MagnifyingGlassPlus, MagnifyingGlassMinus, DotsSix, Palette, TextAa } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { nanoid } from 'nanoid';

interface ImageAnnotationEditorProps {
    imageTemplate: ImageTemplate;
    fieldMappings: FieldMapping[];
    onFieldMappingsChange: (mappings: FieldMapping[]) => void;
    availableFields: AvailableField[];
    isLoading?: boolean;
}

export const ImageAnnotationEditor: React.FC<ImageAnnotationEditorProps> = ({
    imageTemplate,
    fieldMappings,
    onFieldMappingsChange,
    availableFields,
    isLoading = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragField, setDragField] = useState<FieldMapping | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [imageScale, setImageScale] = useState({ width: 0, height: 0, scale: 1 });
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [propertiesPanelPosition, setPropertiesPanelPosition] = useState({ x: 20, y: 20 });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);
    const [panelDragOffset, setPanelDragOffset] = useState({ x: 0, y: 0 });

    // Droppable area for field placement
    const { setNodeRef, isOver } = useDroppable({
        id: 'image-editor',
        data: {
            type: 'image-editor',
        },
    });

    // Get selected field
    const selectedField = fieldMappings.find(f => f.id === selectedFieldId);

    // Calculate image scale based on container
    const calculateImageScale = useCallback(() => {
        if (!imageRef.current || !containerRef.current) return;
        
        const container = containerRef.current;
        const img = imageRef.current;
        
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40;
        
        const scaleX = containerWidth / imageTemplate.width;
        const scaleY = containerHeight / imageTemplate.height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size
        
        const displayWidth = imageTemplate.width * scale;
        const displayHeight = imageTemplate.height * scale;
        
        setImageScale({
            width: displayWidth,
            height: displayHeight,
            scale: scale
        });
    }, [imageTemplate.width, imageTemplate.height]);

    // Handle image load
    const handleImageLoad = () => {
        setIsImageLoaded(true);
        calculateImageScale();
    };

    // Recalculate scale on window resize
    useEffect(() => {
        const handleResize = () => {
            if (isImageLoaded) {
                calculateImageScale();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isImageLoaded, calculateImageScale]);

    // Handle field selection
    const handleFieldClick = (fieldId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        
        // Don't change selection if we're already editing this field
        if (editingFieldId === fieldId) {
            return;
        }
        
        setSelectedFieldId(fieldId);
        setEditingFieldId(null); // Stop editing any other field
    };

    // Handle field drag start
    const handleFieldMouseDown = (field: FieldMapping, event: React.MouseEvent) => {
        if (event.button !== 0) return; // Only left click
        
        // Don't start drag if we're editing this field
        if (editingFieldId === field.id) {
            return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        
        const rect = imageRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        // Set selection immediately
        setSelectedFieldId(field.id);
        setEditingFieldId(null);
        
        // Start drag operation after a small delay to distinguish from click
        setTimeout(() => {
            if (selectedFieldId === field.id) {
                setIsDragging(true);
                setDragField(field);
                
                // Calculate offset from mouse position to field's top-left corner
                const fieldScreenX = field.position.x * imageScale.scale;
                const fieldScreenY = field.position.y * imageScale.scale;
                
                setDragOffset({
                    x: event.clientX - rect.left - fieldScreenX,
                    y: event.clientY - rect.top - fieldScreenY
                });
            }
        }, 100);
    };

    // Handle field drag
    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (!isDragging || !dragField || !imageRef.current) return;
        
        const rect = imageRef.current.getBoundingClientRect();
        
        // Calculate new position relative to image
        const relativeX = event.clientX - rect.left - dragOffset.x;
        const relativeY = event.clientY - rect.top - dragOffset.y;
        
        // Convert to image coordinates
        const imageX = relativeX / imageScale.scale;
        const imageY = relativeY / imageScale.scale;
        
        // Clamp to image boundaries
        const clampedX = Math.max(0, Math.min(imageX, imageTemplate.width - dragField.position.width));
        const clampedY = Math.max(0, Math.min(imageY, imageTemplate.height - dragField.position.height));
        
        const updatedMappings = fieldMappings.map(mapping => 
            mapping.id === dragField.id 
                ? {
                    ...mapping,
                    position: {
                        ...mapping.position,
                        x: clampedX,
                        y: clampedY
                    }
                }
                : mapping
        );
        
        onFieldMappingsChange(updatedMappings);
    }, [isDragging, dragField, dragOffset, fieldMappings, onFieldMappingsChange, imageScale.scale, imageTemplate.width, imageTemplate.height]);

    // Handle field drag end
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setDragField(null);
        setDragOffset({ x: 0, y: 0 });
    }, []);

    // Handle properties panel drag
    const handlePanelMouseDown = (event: React.MouseEvent) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        
        setIsDraggingPanel(true);
        setPanelDragOffset({
            x: event.clientX - propertiesPanelPosition.x,
            y: event.clientY - propertiesPanelPosition.y
        });
    };

    const handlePanelMouseMove = useCallback((event: MouseEvent) => {
        if (!isDraggingPanel) return;
        
        const newX = event.clientX - panelDragOffset.x;
        const newY = event.clientY - panelDragOffset.y;
        
        // Keep panel within viewport bounds
        const maxX = window.innerWidth - 320; // Panel width
        const maxY = window.innerHeight - 400; // Approximate panel height
        
        setPropertiesPanelPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    }, [isDraggingPanel, panelDragOffset]);

    const handlePanelMouseUp = useCallback(() => {
        setIsDraggingPanel(false);
        setPanelDragOffset({ x: 0, y: 0 });
    }, []);

    // Panel drag event listeners
    useEffect(() => {
        if (isDraggingPanel) {
            document.addEventListener('mousemove', handlePanelMouseMove);
            document.addEventListener('mouseup', handlePanelMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handlePanelMouseMove);
                document.removeEventListener('mouseup', handlePanelMouseUp);
            };
        }
        return undefined;
    }, [isDraggingPanel, handlePanelMouseMove, handlePanelMouseUp]);

    // Mouse event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
        return undefined;
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Delete field
    const handleDeleteField = (fieldId: string) => {
        const updatedMappings = fieldMappings.filter(mapping => mapping.id !== fieldId);
        onFieldMappingsChange(updatedMappings);
        setSelectedFieldId(null);
    };

    // Update field style
    const updateFieldStyle = (fieldId: string, styleUpdates: Partial<FieldMapping['style']>) => {
        const updatedMappings = fieldMappings.map(mapping => {
            if (mapping.id === fieldId) {
                const newStyle = { ...mapping.style, ...styleUpdates };
                
                // Auto-adjust field dimensions based on font size
                let newPosition = { ...mapping.position };
                if (styleUpdates.fontSize) {
                    const fontSizeRatio = styleUpdates.fontSize / mapping.style.fontSize;
                    newPosition = {
                        ...newPosition,
                        width: Math.max(120, mapping.position.width * fontSizeRatio),
                        height: Math.max(24, styleUpdates.fontSize + 8) // Font size + padding
                    };
                }
                
                return {
                    ...mapping,
                    style: newStyle,
                    position: newPosition
                };
            }
            return mapping;
        });
        onFieldMappingsChange(updatedMappings);
    };

    // Update field position/size
    const updateFieldPosition = (fieldId: string, positionUpdates: Partial<FieldMapping['position']>) => {
        const updatedMappings = fieldMappings.map(mapping =>
            mapping.id === fieldId
                ? {
                    ...mapping,
                    position: { ...mapping.position, ...positionUpdates }
                }
                : mapping
        );
        onFieldMappingsChange(updatedMappings);
    };

    // Update field display name/text
    const updateFieldText = (fieldId: string, newText: string) => {
        const updatedMappings = fieldMappings.map(mapping =>
            mapping.id === fieldId
                ? {
                    ...mapping,
                    displayName: newText
                }
                : mapping
        );
        onFieldMappingsChange(updatedMappings);
    };

    // Control functions
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 2));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    };

    const handleClearAll = () => {
        onFieldMappingsChange([]);
        setSelectedFieldId(null);
    };

    const handleSaveTemplate = () => {
        // This could trigger a save to the session or show a success message
        console.log('Template saved with', fieldMappings.length, 'field mappings');
    };

    return (
        <div className="relative">
            {/* Main Editor - Full Width */}
            <div className="flex flex-col gap-4">
                {/* Editor Controls */}
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-neutral-700">Image Editor</h3>
                        <span className="text-xs text-neutral-500">
                            {fieldMappings.length} fields mapped
                        </span>
                        {fieldMappings.length > 0 && (
                            <span className="text-xs text-blue-600 italic">
                                • Click to select • Double-click to edit
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50">
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                onClick={handleZoomOut}
                                disabled={zoom <= 0.5}
                                className="border-0 bg-transparent text-xs"
                            >
                                <MagnifyingGlassMinus className="size-3" />
                            </MyButton>
                            <span className="px-2 text-xs text-neutral-600">
                                {Math.round(zoom * 100)}%
                            </span>
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                onClick={handleZoomIn}
                                disabled={zoom >= 2}
                                className="border-0 bg-transparent text-xs"
                            >
                                <MagnifyingGlassPlus className="size-3" />
                            </MyButton>
                        </div>

                        {/* Action Buttons */}
                        <MyButton
                            buttonType="secondary"
                            scale="small"
                            onClick={handleSaveTemplate}
                            className="text-xs"
                        >
                            <FloppyDisk className="size-3 mr-1" />
                            Save
                        </MyButton>

                        <MyButton
                            buttonType="secondary"
                            scale="small"
                            onClick={handleClearAll}
                            disabled={fieldMappings.length === 0}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            <Trash className="size-3 mr-1" />
                            Clear All
                        </MyButton>
                    </div>
                </div>

                {/* Image Editor Container */}
                <div
                    ref={setNodeRef}
                    className={cn(
                        'relative rounded-lg border border-neutral-200 bg-white shadow-sm transition-all duration-200 overflow-hidden',
                        isOver && 'border-blue-400 bg-blue-50',
                        isLoading && 'opacity-50'
                    )}
                    style={{ minHeight: '600px' }}
                >
                    <div 
                        ref={containerRef}
                        className="relative w-full h-full min-h-[600px] flex items-center justify-center p-4"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                        onClick={(e) => {
                            // Only deselect if clicking on the container background, not on fields or if editing
                            if (e.target === e.currentTarget && !editingFieldId) {
                                setSelectedFieldId(null);
                                setEditingFieldId(null);
                            }
                        }}
                    >
                        {/* Certificate Image */}
                        <div 
                            className="relative"
                            onClick={(e) => {
                                // Deselect field when clicking on image background, but not if editing
                                if ((e.target === e.currentTarget || e.target === imageRef.current) && !editingFieldId) {
                                    setSelectedFieldId(null);
                                    setEditingFieldId(null);
                                }
                            }}
                        >
                            <img
                                ref={imageRef}
                                src={imageTemplate.imageDataUrl}
                                alt="Certificate template"
                                onLoad={handleImageLoad}
                                className="block max-w-full max-h-full object-contain border border-neutral-300 rounded"
                                style={{
                                    width: imageScale.width,
                                    height: imageScale.height,
                                }}
                            />

                            {/* Field Overlays */}
                            {isImageLoaded && fieldMappings.map((field) => {
                                const screenX = field.position.x * imageScale.scale;
                                const screenY = field.position.y * imageScale.scale;
                                const screenWidth = field.position.width * imageScale.scale;
                                const screenHeight = field.position.height * imageScale.scale;
                                
                                return (
                                    <div
                                        key={field.id}
                                        className={cn(
                                            'absolute border-2 border-dashed transition-all select-none',
                                            editingFieldId === field.id
                                                ? 'cursor-text border-green-500 bg-green-100/30'
                                                : selectedFieldId === field.id
                                                ? 'cursor-move border-blue-500 bg-blue-100/30'
                                                : 'cursor-pointer border-blue-300 bg-blue-50/20 hover:border-blue-400'
                                        )}
                                        style={{
                                            left: screenX,
                                            top: screenY,
                                            width: screenWidth,
                                            height: screenHeight,
                                        }}
                                        onClick={(e) => handleFieldClick(field.id, e)}
                                        onMouseDown={(e) => handleFieldMouseDown(field, e)}
                                        title={editingFieldId === field.id ? "Press Enter or Escape to finish editing" : "Click to select, double-click to edit text"}
                                    >
                                        {/* Field Content with Applied Styles */}
                                        <div 
                                            className="w-full h-full flex items-center justify-between overflow-hidden relative"
                                            style={{
                                                backgroundColor: field.style.backgroundColor,
                                                padding: (field.style.padding || 2) * imageScale.scale,
                                            }}
                                        >
                                            {editingFieldId === field.id ? (
                                                <div className="absolute inset-0 z-10">
                                                    <input
                                                        type="text"
                                                        value={field.displayName}
                                                        onChange={(e) => updateFieldText(field.id, e.target.value)}
                                                        onBlur={() => setEditingFieldId(null)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === 'Escape') {
                                                                setEditingFieldId(null);
                                                            }
                                                            e.stopPropagation();
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        autoFocus
                                                        className="w-full h-full bg-white border-2 border-blue-400 rounded px-2 py-1 shadow-lg"
                                                        style={{
                                                            fontSize: Math.max(12, field.style.fontSize * imageScale.scale),
                                                            color: field.style.fontColor,
                                                            fontFamily: field.style.fontFamily,
                                                            fontWeight: field.style.fontWeight,
                                                            textAlign: field.style.alignment,
                                                            minWidth: '120px',
                                                            minHeight: '32px',
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex-1 cursor-text"
                                                    style={{
                                                        fontSize: Math.max(8, field.style.fontSize * imageScale.scale),
                                                        color: field.style.fontColor,
                                                        fontFamily: field.style.fontFamily,
                                                        fontWeight: field.style.fontWeight,
                                                        textAlign: field.style.alignment,
                                                        lineHeight: '1.2',
                                                        wordBreak: 'break-word',
                                                    }}
                                                    onDoubleClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setEditingFieldId(field.id);
                                                        setSelectedFieldId(field.id);
                                                        setIsDragging(false); // Stop any dragging
                                                    }}
                                                >
                                                    {field.displayName}
                                                </div>
                                            )}
                                            
                                            {/* Delete Button - Only show when selected and not editing */}
                                            {selectedFieldId === field.id && editingFieldId !== field.id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteField(field.id);
                                                    }}
                                                    className="ml-1 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors absolute -top-2 -right-2 bg-white border"
                                                    title="Delete field"
                                                >
                                                    <Trash className="size-3" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Move Handle */}
                                        {selectedFieldId === field.id && (
                                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1 cursor-move">
                                                <DotsSix className="size-2" />
                                            </div>
                                        )}
                                        
                                        {/* Field Border Overlay for Better Selection */}
                                        {selectedFieldId === field.id && (
                                            <div className="absolute inset-0 border-2 border-blue-400 rounded pointer-events-none" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    {!isImageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="size-8 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600 mx-auto mb-3" />
                                <p className="text-sm text-neutral-600">Loading template...</p>
                            </div>
                        </div>
                    )}

                    {/* Drop Overlay */}
                    {isOver && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/90">
                            <div className="text-center">
                                <div className="rounded-full bg-blue-100 p-4 mx-auto mb-3">
                                    <Eye className="size-8 text-blue-600" />
                                </div>
                                <p className="text-lg font-medium text-blue-800">Drop field here</p>
                                <p className="text-sm text-blue-600">Position the field on your certificate template</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Field Mappings Summary */}
                {fieldMappings.length > 0 && (
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                        <h4 className="text-sm font-medium text-neutral-700 mb-3">
                            Field Mappings ({fieldMappings.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {fieldMappings.map((mapping) => (
                                <div
                                    key={mapping.id}
                                    className={cn(
                                        'rounded-md border p-2 text-xs transition-all cursor-pointer',
                                        selectedFieldId === mapping.id
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                                    )}
                                    onClick={() => setSelectedFieldId(mapping.id)}
                                >
                                    <div className="font-medium text-neutral-700 truncate">
                                        {mapping.displayName}
                                    </div>
                                    <div className="text-neutral-500">
                                        x:{Math.round(mapping.position.x)}, y:{Math.round(mapping.position.y)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Field Properties Panel */}
            {selectedField && (
                <div 
                    className="fixed w-80 rounded-lg border border-neutral-200 bg-white shadow-lg z-50"
                    style={{
                        left: propertiesPanelPosition.x,
                        top: propertiesPanelPosition.y,
                    }}
                >
                    {/* Draggable Header */}
                    <div 
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg cursor-move border-b border-neutral-200"
                        onMouseDown={handlePanelMouseDown}
                    >
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-purple-100 p-2">
                                <Palette className="size-4 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-neutral-700">Field Properties</h3>
                                <p className="text-xs text-neutral-500">{selectedField.displayName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <MyButton
                                buttonType="secondary"
                                scale="small"
                                onClick={() => handleDeleteField(selectedField.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash className="size-3 mr-1" />
                                Remove
                            </MyButton>
                            <button
                                onClick={() => setSelectedFieldId(null)}
                                className="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                                title="Close properties"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    
                    {/* Panel Content */}
                    <div className="p-4">
                        <div className="space-y-4">
                        {/* Font Size */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Font Size
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="72"
                                value={selectedField.style.fontSize}
                                onChange={(e) => updateFieldStyle(selectedField.id, { fontSize: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>8px</span>
                                <span className="font-medium">{selectedField.style.fontSize}px</span>
                                <span>72px</span>
                            </div>
                        </div>

                        {/* Font Family */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Font Family
                            </label>
                            <select
                                value={selectedField.style.fontFamily}
                                onChange={(e) => updateFieldStyle(selectedField.id, { fontFamily: e.target.value })}
                                className="w-full p-2 text-sm border border-neutral-200 rounded-md"
                            >
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="Times New Roman, serif">Times New Roman</option>
                                <option value="Helvetica, sans-serif">Helvetica</option>
                                <option value="Georgia, serif">Georgia</option>
                                <option value="Courier New, monospace">Courier New</option>
                                <option value="Verdana, sans-serif">Verdana</option>
                                <option value="Impact, sans-serif">Impact</option>
                            </select>
                        </div>

                        {/* Font Weight */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Font Weight
                            </label>
                            <select
                                value={selectedField.style.fontWeight}
                                onChange={(e) => updateFieldStyle(selectedField.id, { fontWeight: e.target.value as 'normal' | 'bold' })}
                                className="w-full p-2 text-sm border border-neutral-200 rounded-md"
                            >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>

                        {/* Text Color */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Text Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={selectedField.style.fontColor}
                                    onChange={(e) => updateFieldStyle(selectedField.id, { fontColor: e.target.value })}
                                    className="w-12 h-8 border border-neutral-200 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selectedField.style.fontColor}
                                    onChange={(e) => updateFieldStyle(selectedField.id, { fontColor: e.target.value })}
                                    className="flex-1 p-2 text-sm border border-neutral-200 rounded-md"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        {/* Text Alignment */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Text Alignment
                            </label>
                            <div className="flex gap-1">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateFieldStyle(selectedField.id, { alignment: align })}
                                        className={cn(
                                            'flex-1 p-2 text-xs border rounded-md transition-all',
                                            selectedField.style.alignment === align
                                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                        )}
                                    >
                                        {align.charAt(0).toUpperCase() + align.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background Color */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Background Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={
                                        selectedField.style.backgroundColor && 
                                        selectedField.style.backgroundColor !== 'transparent' &&
                                        !selectedField.style.backgroundColor.includes('rgba')
                                            ? selectedField.style.backgroundColor 
                                            : '#ffffff'
                                    }
                                    onChange={(e) => updateFieldStyle(selectedField.id, { backgroundColor: e.target.value })}
                                    className="w-12 h-8 border border-neutral-200 rounded cursor-pointer"
                                />
                                <button
                                    onClick={() => updateFieldStyle(selectedField.id, { backgroundColor: 'transparent' })}
                                    className="px-3 py-2 text-xs border border-neutral-200 rounded-md hover:bg-neutral-50"
                                >
                                    Clear
                                </button>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Current: {selectedField.style.backgroundColor || 'transparent'}
                            </p>
                        </div>

                        {/* Field Position */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Position
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">X Position</label>
                                    <input
                                        type="number"
                                        value={Math.round(selectedField.position.x)}
                                        onChange={(e) => updateFieldPosition(selectedField.id, { x: parseInt(e.target.value) || 0 })}
                                        className="w-full p-2 text-sm border border-neutral-200 rounded-md"
                                        min="0"
                                        max={imageTemplate.width}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Y Position</label>
                                    <input
                                        type="number"
                                        value={Math.round(selectedField.position.y)}
                                        onChange={(e) => updateFieldPosition(selectedField.id, { y: parseInt(e.target.value) || 0 })}
                                        className="w-full p-2 text-sm border border-neutral-200 rounded-md"
                                        min="0"
                                        max={imageTemplate.height}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Field Size */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Field Size
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Width</label>
                                    <input
                                        type="number"
                                        value={selectedField.position.width}
                                        onChange={(e) => updateFieldPosition(selectedField.id, { width: parseInt(e.target.value) || 120 })}
                                        className="w-full p-2 text-sm border border-neutral-200 rounded-md"
                                        min="50"
                                        max="500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Height</label>
                                    <input
                                        type="number"
                                        value={selectedField.position.height}
                                        onChange={(e) => updateFieldPosition(selectedField.id, { height: parseInt(e.target.value) || 24 })}
                                        className="w-full p-2 text-sm border border-neutral-200 rounded-md"
                                        min="16"
                                        max="200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}; 