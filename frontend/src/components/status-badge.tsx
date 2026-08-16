import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // Lead statuses
  "New": "bg-blue-100 text-blue-800 border-blue-200",
  "Contacted": "bg-amber-100 text-amber-800 border-amber-200",
  "Follow-up": "bg-purple-100 text-purple-800 border-purple-200",
  "Discovery Scheduled": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Converted": "bg-green-100 text-green-800 border-green-200",
  "Not Interested": "bg-gray-100 text-gray-700 border-gray-200",
  // Scores
  "Hot": "bg-red-100 text-red-700 border-red-200",
  "Warm": "bg-amber-100 text-amber-800 border-amber-200",
  "Cold": "bg-sky-100 text-sky-800 border-sky-200",
  // Outreach
  "Draft Generated": "bg-gray-100 text-gray-700 border-gray-200",
  "Ready to Send": "bg-blue-100 text-blue-800 border-blue-200",
  "Sent": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Opened": "bg-purple-100 text-purple-800 border-purple-200",
  "Replied": "bg-green-100 text-green-800 border-green-200",
  "Follow-up Due": "bg-amber-100 text-amber-800 border-amber-200",
  "Meeting Booked": "bg-emerald-100 text-emerald-800 border-emerald-200",
  // Follow-up
  "Pending": "bg-amber-100 text-amber-800 border-amber-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
  // Meeting
  "Scheduled": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Done": "bg-green-100 text-green-800 border-green-200",
  "Cancelled": "bg-gray-100 text-gray-700 border-gray-200",
  // Difficulty
  "Low": "bg-green-100 text-green-700 border-green-200",
  "Medium": "bg-amber-100 text-amber-800 border-amber-200",
  "High": "bg-red-100 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  return (
    <Badge variant="outline" className={cn("font-medium border", STATUS_STYLES[status] || "bg-gray-100 text-gray-700")}>
      {status}
    </Badge>
  );
}
