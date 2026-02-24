import { Button } from '@/components/ui/button';
import { getComponentTemplate, componentTemplates } from '../-utils/component-templates';
import { useEditorStore } from '../-stores/editor-store';
import { Plus } from 'lucide-react';

export const ComponentLibrary = () => {
    const { addComponent, selectedPageId } = useEditorStore();

    const handleAdd = (type: string) => {
        if (!selectedPageId) return;
        const component = getComponentTemplate(type);
        addComponent(selectedPageId, component);
    };

    return (
        <div className="flex flex-col gap-2 overflow-y-auto p-4">
            {Object.keys(componentTemplates).map((type) => (
                <Button
                    key={type}
                    variant="outline"
                    className="h-auto justify-start px-4 py-3"
                    onClick={() => handleAdd(type)}
                    disabled={!selectedPageId}
                >
                    <Plus className="mr-2 size-4" />
                    <div className="flex flex-col items-start">
                        <span className="font-medium capitalize">
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs font-normal text-gray-500">Click to add</span>
                    </div>
                </Button>
            ))}
        </div>
    );
};
