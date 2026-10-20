// src/components/ui/widgetSkeleton.tsx
import styles from "@/styles/components/ui/WidgetSkeleton.module.scss";

type WidgetSkeletonProps = {
  // Same accessible name as the widget it stands in for
  label: string;
  // Corner radius of the widget's frame, see $widget-radius
  size?: "lg" | "sm";
};

// Empty placeholder for a widget while it loads. Its size comes from the
// dashboard slot, so it takes exactly the space the widget will fill.
const WidgetSkeleton = ({ label, size = "lg" }: WidgetSkeletonProps) => {
  return (
    <section
      className={`${styles.skeleton} ${styles[size]}`}
      aria-label={label}
      aria-busy="true"
    />
  );
};

export default WidgetSkeleton;
