import type { Subject, Module, Chapter, Slide } from '../course/courseData';

// Types based on AI modifications payload
export interface Modification {
  action: 'ADD' | 'UPDATE' | 'DELETE';
  targetType: 'COURSE' | 'SUBJECT' | 'MODULE' | 'CHAPTER' | 'SLIDE';
  parentPath: string | null;
  node: any; // Raw node coming from AI
}

/**
 * Apply a list of structural modifications (ADD only for now) to the existing
 * course data tree immutably and return the new tree.
 */
export function applyModifications(
  current: Subject[],
  modifications: Modification[]
): Subject[] {
  let updated: Subject[] = JSON.parse(JSON.stringify(current)); // deep clone simple structures

  modifications.forEach(mod => {
    if (mod.action !== 'ADD') return; // Only ADD supported for now

    switch (mod.targetType) {
      case 'SUBJECT': {
        const subjectNode = mapSubject(mod.node);
        updated.push(subjectNode);
        break;
      }
      case 'MODULE': {
        if (!mod.parentPath) return;
        const subjectId = getIdFromPath(mod.parentPath, 'S');
        if (!subjectId) return;
        updated = updated.map(sub => {
          if (sub.id !== subjectId) return sub;
          const modules = [...sub.modules, mapModule(mod.node)];
          return { ...sub, modules };
        });
        break;
      }
      case 'CHAPTER': {
        if (!mod.parentPath) return;
        const { subjectId, moduleId } = extractSubjectModuleIds(mod.parentPath);
        if (!subjectId || !moduleId) return;
        updated = updated.map(sub => {
          if (sub.id !== subjectId) return sub;
          return {
            ...sub,
            modules: sub.modules.map(modu => {
              if (modu.id !== moduleId) return modu;
              const chapters = [...modu.chapters, mapChapter(mod.node)];
              return { ...modu, chapters };
            }),
          };
        });
        break;
      }
      case 'SLIDE': {
        if (!mod.parentPath) return;
        const ids = extractIds(mod.parentPath);
        const { subjectId, moduleId, chapterId } = ids;
        if (!subjectId || !moduleId || !chapterId) return;
        updated = updated.map(sub => {
          if (sub.id !== subjectId) return sub;
          return {
            ...sub,
            modules: sub.modules.map(modu => {
              if (modu.id !== moduleId) return modu;
              return {
                ...modu,
                chapters: modu.chapters.map(chap => {
                  if (chap.id !== chapterId) return chap;
                  const slides = [...chap.slides, mapSlide(mod.node)];
                  return { ...chap, slides };
                }),
              };
            }),
          };
        });
        break;
      }
      default:
        break;
    }
  });

  return updated;
}

/* ---------- Helpers ---------- */
function getIdFromPath(path: string, prefixLetter: string): string | null {
  const parts = path.split('.');
  const match = parts.find(p => p.startsWith(prefixLetter));
  return match ?? null;
}

function extractSubjectModuleIds(path: string): { subjectId: string | null; moduleId: string | null } {
  const parts = path.split('.');
  const subjectId = parts.find(p => p.startsWith('S')) ?? null;
  const moduleId = parts.find(p => p.startsWith('M')) ?? null;
  return { subjectId, moduleId };
}

function extractIds(path: string): { subjectId: string | null; moduleId: string | null; chapterId: string | null } {
  const parts = path.split('.');
  const subjectId = parts.find(p => p.startsWith('S')) ?? null;
  const moduleId = parts.find(p => p.startsWith('M')) ?? null;
  const chapterId = parts.find(p => p.startsWith('CH')) ?? null;
  return { subjectId, moduleId, chapterId };
}

function mapSubject(node: any): Subject {
  return {
    id: node.id ?? node.path?.split('.').pop() ?? `S-${Date.now()}`,
    name: node.name || 'Unnamed Subject',
    key: node.key,
    depth: node.depth,
    path: node.path,
    modules: [],
  };
}

function mapModule(node: any): Module {
  return {
    id: node.id ?? node.path?.split('.').pop() ?? `M-${Date.now()}`,
    name: node.name || 'Unnamed Module',
    key: node.key,
    depth: node.depth,
    path: node.path,
    chapters: [],
  };
}

function mapChapter(node: any): Chapter {
  return {
    id: node.id ?? node.path?.split('.').pop() ?? `CH-${Date.now()}`,
    name: node.name || 'Unnamed Chapter',
    key: node.key,
    depth: node.depth,
    path: node.path,
    slides: [],
  };
}

function mapSlide(node: any): Slide {
  return {
    id: node.id ?? node.path?.split('.').pop() ?? `SL-${Date.now()}`,
    name: node.name || 'Unnamed Slide',
    key: node.key,
    depth: node.depth,
    path: node.path,
    type: node.type || 'text',
    content: node.content,
  } as Slide;
} 