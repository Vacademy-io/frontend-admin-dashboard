import { PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useTheme } from "@/providers/theme/theme-provider";

const chartConfig = {
    visitors: {
        label: "Visitors",
        color: "#F6B97B",
    },
} satisfies ChartConfig;

export function CompletionStatusComponent({
    profileCompletionPercentage,
}: {
    profileCompletionPercentage: number;
}) {
    const {primaryColor} = useTheme();
    const chartData = [
        {
            browser: "visitors",
            visitors: profileCompletionPercentage,
            fill: primaryColor ? primaryColor :"var(--color-visitors)",
        },
    ];
    return (
        <ChartContainer config={chartConfig} className="h-[100px] w-[80px]">
            <RadialBarChart
                data={chartData}
                startAngle={0}
                endAngle={profileCompletionPercentage * 4}
                innerRadius={30}
                outerRadius={50}
            >
                <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[35, 35]}
                />
                <RadialBar dataKey="visitors" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
            </RadialBarChart>
        </ChartContainer>
    );
}
