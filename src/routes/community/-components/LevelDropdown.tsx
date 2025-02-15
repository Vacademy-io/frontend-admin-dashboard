// // components/session-dropdown.tsx
// import { MyDropdown } from "@/components/design-system/dropdown";
// import { useSessionDropdown } from "@/hooks/student-list-section/useSessionDropdown";
// import { Level, Stream, Subject } from "@/types/community/types";

// interface LevelDropdownProps {
//     sessionDirection?: string;
//     defaultSession?: string;
//     onSessionChange?: (session: string) => void;
//     FilterList: Level[];
// }

// export const LevelDropdown = ({
//     sessionDirection,
//     defaultSession,
//     onSessionChange,
//     FilterList,
// }: LevelDropdownProps) => {
//     const { sessionList, currentSession, handleSessionChange } = useSessionDropdown({
//         defaultSession,
//         onSessionChange,
//     });

//     return (
//         <div className={`flex items-center gap-2 ${sessionDirection}`}>
//             <MyDropdown
//                 currentValue={currentSession}
//                 dropdownList={FilterList}
//                 placeholder="Select Session"
//                 handleChange={handleSessionChange}
//             />
//         </div>
//     );
// };
