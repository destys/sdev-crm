import { SectionCards } from "@/components/dashboard/section-cards";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { ChartAreaLegend } from "@/components/dashboard/area-chart";

export default function Home() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <SectionCards />
      <ChartAreaInteractive />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <ChartAreaLegend />
        <ChartAreaLegend />
        <ChartAreaLegend />
      </div>
    </div>
  );
}
