"use client";

import { GripVertical, GripHorizontal } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  ...props
}: ComponentProps<typeof Group>) => (
  <Group
    className={cn(
      "flex h-full w-full",
      "data-[panel-group-direction=vertical]:flex-col",
      className,
    )}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: ComponentProps<typeof Separator> & { withHandle?: boolean }) => (
  <Separator
    className={cn(
      "group/sep relative flex shrink-0 items-center justify-center transition-colors",
      "bg-white/5 hover:bg-white/15 active:bg-indigo-500/40",
      "aria-[orientation=horizontal]:h-1 aria-[orientation=horizontal]:w-full",
      "aria-[orientation=vertical]:w-1 aria-[orientation=vertical]:h-full",
      "after:absolute",
      "aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:left-1/2 aria-[orientation=vertical]:after:w-3 aria-[orientation=vertical]:after:-translate-x-1/2",
      "aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:top-1/2 aria-[orientation=horizontal]:after:h-3 aria-[orientation=horizontal]:after:-translate-y-1/2",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div
        className={cn(
          "z-10 flex items-center justify-center rounded-sm bg-white/10 border border-white/20 shadow-sm",
          "group-aria-[orientation=vertical]/sep:h-6 group-aria-[orientation=vertical]/sep:w-3",
          "group-aria-[orientation=horizontal]/sep:h-3 group-aria-[orientation=horizontal]/sep:w-6",
        )}
      >
        <GripVertical className="h-3 w-3 text-white/50 group-aria-[orientation=horizontal]/sep:hidden" />
        <GripHorizontal className="h-3 w-3 text-white/50 group-aria-[orientation=vertical]/sep:hidden" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
