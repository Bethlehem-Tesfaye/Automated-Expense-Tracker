import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li {...props} />;
}

interface PaginationButtonProps extends React.ComponentProps<"button"> {
  isActive?: boolean;
}

function PaginationButton({
  className,
  isActive,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "border-[#1C4D8D] bg-[#1C4D8D] text-white"
          : "border-[#BDE8F5] bg-white text-[#0F2854] hover:bg-[#BDE8F5]/40",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious(
  props: React.ComponentProps<typeof PaginationButton>,
) {
  return (
    <PaginationButton aria-label="Go to previous page" {...props}>
      <ChevronLeft className="h-4 w-4" />
      <span className="ml-1">Previous</span>
    </PaginationButton>
  );
}

function PaginationNext(props: React.ComponentProps<typeof PaginationButton>) {
  return (
    <PaginationButton aria-label="Go to next page" {...props}>
      <span className="mr-1">Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationButton>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
};
