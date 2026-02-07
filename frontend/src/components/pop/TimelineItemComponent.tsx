import type { TimelineItem } from "@/lib/types";
import TimelineCard from "./TimelineCard";
import TimelineReportCard from "./TimelineReportCard";

interface TimelineItemComponentProps {
  item: TimelineItem;
}

export default function TimelineItemComponent({
  item,
}: TimelineItemComponentProps) {
  if (item.item_type === "report" && item.report) {
    return <TimelineReportCard report={item.report} />;
  }
  if (item.item_type === "insight" && item.insight) {
    return <TimelineCard insight={item.insight} />;
  }
  return null;
}
