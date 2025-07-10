// stores/content-store.ts
import { create } from 'zustand';
import { Slide } from '@/routes/study-library/courses/course-details/subjects/modules/chapters/slides/-hooks/use-slides';

interface ContentStore {
    items: Slide[];
    activeItem: Slide | null;
    setItems: (items: Slide[]) => void;
    setActiveItem: (item: Slide | null) => void;
    reorderItems: (oldIndex: number, newIndex: number) => void;
    resetChapterSidebarStore: () => void;
    getSlideById: (slideId: string) => Slide | null;
    updateActiveSlideQuestions: (questions: any[]) => void;
}

export const useContentStore = create<ContentStore>((set, get) => ({
    items: [],
    activeItem: null,

    setItems: (items) => {
        console.log(`[ContentStore] 🏪 setItems called:`, {
            itemsType: typeof items,
            isArray: Array.isArray(items),
            length: items?.length || 0,
            firstTwo: items?.slice(0, 2).map((item) => ({ id: item.id, title: item.title })) || [],
            caller: new Error().stack?.split('\n')[2]?.trim() || 'Unknown caller',
        });
        set({ items });
    },

    setActiveItem: (item) => {
        console.log(`[ContentStore] 🎯 setActiveItem called:`, {
            itemId: item?.id || 'null',
            itemTitle: item?.title || 'null',
            caller: new Error().stack?.split('\n')[2]?.trim() || 'Unknown caller',
        });
        set({ activeItem: item });
    },

    reorderItems: (oldIndex: number, newIndex: number) =>
        set((state) => {
            if (
                oldIndex < 0 ||
                oldIndex >= state.items.length ||
                newIndex < 0 ||
                newIndex >= state.items.length
            ) {
                return state;
            }

            const newItems = [...state.items];
            const movedItem: Slide = newItems[oldIndex]!;
            newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            return {
                ...state,
                items: newItems,
            };
        }),

    resetChapterSidebarStore: () => set({ items: [], activeItem: null }),

    getSlideById: (slideId: string) => {
        const state = get();
        return state.items.find((slide) => slide.id === slideId) || null;
    },

    updateActiveSlideQuestions: (questions: any[]) => {
        set((state) => {
            if (!state.activeItem) return state;

            const updatedItem = {
                ...state.activeItem,
                question_slide: questions,
            };

            const updatedItems = state.items.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
            );

            return {
                activeItem: updatedItem,
                items: updatedItems,
            };
        });
    },
}));
