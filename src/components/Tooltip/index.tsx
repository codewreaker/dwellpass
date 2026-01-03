//import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';
// import { Tooltip as BaseTooltip } from '@base-ui/react/tooltiÊp';
// import './style.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

// interface TooltipProps {
//   content: React.ReactNode;
//   children: React.ReactNode;
//   position?: TooltipPosition;
//   delay?: number;
// }

/**
 * Simple Tooltip Component
 * 
 * Usage:
 * <Tooltip content="Hello!" position="top">
 *   <button>Hover me</button>
 * </Tooltip>
 */
// export const Tooltip: React.FC<TooltipProps> = ({
//   content,
//   children,
//   position = 'top',
//   delay = 300,
// }) => {
//   return (
//     <BaseTooltip.Provider delay={delay}>
//       <BaseTooltip.Root>
//         <BaseTooltip.Trigger className="tooltip-trigger">
//           {children}
//         </BaseTooltip.Trigger>
//         <BaseTooltip.Portal>
//           <BaseTooltip.Positioner side={position} sideOffset={8}>
//             <BaseTooltip.Popup className="tooltip-popup">
//               {content}
//             </BaseTooltip.Popup>
//             <BaseTooltip.Arrow className="tooltip-arrow" />
//           </BaseTooltip.Positioner>
//         </BaseTooltip.Portal>
//       </BaseTooltip.Root>
//     </BaseTooltip.Provider>
//   );
// };

export default Tooltip;

