import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200/90 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-linear-to-r before:from-transparent before:via-white/70 before:to-transparent before:content-[''] motion-reduce:before:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
