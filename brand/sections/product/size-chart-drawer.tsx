"use client";

import { RulerIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { convertSizeChartRows } from "@/lib/store-content";
import type { SizeChart, SizeChartUnit } from "@/lib/store-content/types";

const UNIT_LABELS: Record<SizeChartUnit, string> = { cm: "cm", in: "inches" };

export function SizeChartDrawer({ chart }: { chart: SizeChart }) {
  const [unit, setUnit] = useState<SizeChartUnit | undefined>(chart.unit);
  const rows = chart.unit && unit ? convertSizeChartRows(chart.rows, chart.unit, unit) : chart.rows;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="justify-self-start px-0" variant="link">
            <RulerIcon aria-hidden="true" className="size-4" />
            Size chart
          </Button>
        }
      />
      <SheetContent className="gap-5 overflow-y-auto p-5" side="right">
        <div className="grid gap-1 pr-10">
          <SheetTitle className="text-lg font-medium">{chart.name}</SheetTitle>
          {unit ? (
            <SheetDescription className="text-sm text-muted-foreground">
              Measurements in {UNIT_LABELS[unit]}.
            </SheetDescription>
          ) : null}
        </div>
        {chart.unit ? (
          <div className="flex gap-2" role="group" aria-label="Units">
            {(["cm", "in"] as const).map((option) => (
              <Button
                aria-pressed={unit === option}
                key={option}
                onClick={() => setUnit(option)}
                size="sm"
                variant={unit === option ? "default" : "outline"}
              >
                {UNIT_LABELS[option]}
              </Button>
            ))}
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {chart.columns.map((column) => (
                  <th className="border-b py-2 pr-4 text-left font-medium" key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${row[0]}-${rowIndex}`}>
                  {chart.columns.map((column, cellIndex) =>
                    cellIndex === 0 ? (
                      <th
                        className="border-b py-2 pr-4 text-left font-medium"
                        key={column}
                        scope="row"
                      >
                        {row[cellIndex] ?? ""}
                      </th>
                    ) : (
                      <td className="border-b py-2 pr-4 tabular-nums" key={column}>
                        {row[cellIndex] ?? ""}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {chart.note ? (
          <p className="whitespace-pre-line text-sm text-muted-foreground">{chart.note}</p>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
