"use client";

import React, { useMemo, useCallback } from "react";
import { extent, bisector } from "d3-array";
import { timeFormat } from "d3-time-format";
import { AxisBottom, AxisRight } from "@visx/axis";
import { LinePath, Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleLinear, scaleTime } from "@visx/scale";
import { GridRows } from "@visx/grid";
import { curveLinear } from "@visx/curve";
import { withTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";

import { getDimensions, xAccessor, yAccessor } from "#/utils/line-chart";

export interface ILineChart {
  value: number;
  time: string;
}

const formatDate = timeFormat("%b %d, %H:%M");
const tooltipStyles = {
  ...defaultStyles,
  background: "rgba(0, 0, 0, 0.9)",
  borderRadius: "4px",
  color: "white",
};

const bisectDate = bisector<ILineChart, Date>((d) => xAccessor(d)).left;

type Props = {
  width: number;
  height: number;
  data?: ILineChart[];
  LpValue?: number;
  LatestValue?: number;
  linePathColor?: string;
};

function LineChart({
  width,
  height,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipLeft,
  tooltipTop,
  data,
  LpValue,
  LatestValue,
  linePathColor = "#FFCA43",
}: Props & any) {
  const { margin, boundedWidth, boundedHeight } = getDimensions({
    width,
    height,
  });

  const xScale = useMemo(
    () =>
      scaleTime({
        domain: extent(data, xAccessor) as [Date, Date],
        range: [0, boundedWidth],
        nice: true,
      }),
    [data, boundedWidth],
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: extent(data, yAccessor) as [number, number],
        range: [boundedHeight, 0],
        nice: true,
      }),
    [data, boundedHeight],
  );

  const handleTooltip = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && xAccessor(d1)) {
        d =
          x0.valueOf() - xAccessor(d0).valueOf() >
          xAccessor(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(yAccessor(d)),
      });
    },
    [showTooltip, yScale, xScale, data],
  );

  const customYPosition = yScale(LpValue);
  const yTickValues = yScale.ticks(8);

  if (!yTickValues.includes(LpValue)) {
    yTickValues.push(LpValue);
  }
  if (!yTickValues.includes(LatestValue)) {
    yTickValues.push(LatestValue);
  }

  return (
    <div className="w-fit">
      <svg width={width} height={height} role="figure">
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        <Group top={margin.top} left={margin.left}>
          <GridRows
            scale={yScale}
            width={boundedWidth}
            strokeDasharray="1,3"
            stroke="#262626"
            pointerEvents="none"
          />
          <LinePath<ILineChart>
            curve={curveLinear}
            data={data}
            stroke={linePathColor}
            strokeWidth={1.5}
            x={(d: ILineChart) => xScale(xAccessor(d)) ?? 0}
            y={(d: ILineChart) => yScale(yAccessor(d)) ?? 0}
          />
          <Bar
            x={0}
            y={0}
            width={boundedWidth}
            height={boundedHeight}
            fill="transparent"
            onMouseMove={handleTooltip}
            onMouseLeave={hideTooltip}
          />
          {customYPosition && (
            <line
              x1={0}
              x2={boundedWidth}
              y1={customYPosition}
              y2={customYPosition}
              stroke="white"
              strokeWidth={1}
              strokeDasharray="3,5"
            />
          )}
          <AxisRight
            left={boundedWidth + margin.right - 40}
            scale={yScale}
            top={0}
            hideAxisLine={true}
            hideTicks={true}
            tickValues={yTickValues}
            tickFormat={(value) => `${Number(value).toFixed(1)}`}
            tickLabelProps={() => ({
              fill: "#A6A6A6",
              fontSize: 9,
              textAnchor: "start",
            })}
            tickComponent={({ formattedValue, x, y }) => {
              const numFormattedValue = Number(formattedValue);
              const isLPValue = numFormattedValue === LpValue;
              const isLatestValue = numFormattedValue === LatestValue;

              const text = isLPValue
                ? `LP ${LpValue.toFixed(1)}`
                : isLatestValue
                  ? `${LatestValue.toFixed(1)}`
                  : formattedValue || "";

              const paddingX = 8;
              const paddingY = 2;
              const fontSize = 9;

              const textWidth = text.length * (fontSize * 0.6);
              const rectWidth = textWidth + paddingX;
              const rectHeight = fontSize + paddingY;

              if (isLPValue) {
                return (
                  <g transform={`translate(${x},${y})`}>
                    <rect
                      x={-rectWidth / 2}
                      y={-rectHeight / 2}
                      width={rectWidth}
                      height={rectHeight}
                      fill="#4d4d4d"
                      rx={0}
                    />
                    <text
                      fill="white"
                      fontSize={fontSize}
                      textAnchor="middle"
                      dy="0.32em"
                      x={0}
                    >
                      LP {LpValue.toFixed(1)}
                    </text>
                  </g>
                );
              } else if (isLatestValue) {
                return (
                  <g transform={`translate(${x},${y})`}>
                    <rect
                      x={-rectWidth / 2}
                      y={-rectHeight / 2}
                      width={rectWidth}
                      height={rectHeight}
                      fill="white"
                      rx={0}
                    />
                    <text
                      fill="black"
                      fontWeight="700"
                      fontSize={fontSize}
                      textAnchor="middle"
                      dy="0.32em"
                      x={0}
                    >
                      {LatestValue.toFixed(1)}
                    </text>
                  </g>
                );
              } else {
                return (
                  <text
                    fill="#A6A6A6"
                    fontSize={fontSize}
                    textAnchor="start"
                    dy="0.32em"
                    x={-10}
                    y={y}
                  >
                    {formattedValue}
                  </text>
                );
              }
            }}
          />
          <AxisBottom
            rangePadding={41}
            top={boundedHeight}
            hideAxisLine={true}
            hideTicks={true}
            scale={xScale}
            tickFormat={(d) =>
              d instanceof Date ? timeFormat("%H:%M")(d) : ""
            }
            tickLabelProps={() => ({
              fill: "white",
              fontSize: 8,
              textAnchor: "middle",
            })}
          />
        </Group>
        {tooltipData && (
          <g>
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 10}
              r={4}
              fill="white"
              stroke="white"
              strokeWidth={1}
            />
          </g>
        )}
      </svg>
      {tooltipData && (
        <div>
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={tooltipStyles}
          >
            {`Value: ${yAccessor(tooltipData)}`}
          </TooltipWithBounds>
        </div>
      )}
    </div>
  );
}

export default withTooltip(LineChart);
