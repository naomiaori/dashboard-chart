"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineWidth,
  Time,
} from "lightweight-charts";
import Socket from "#/services/socket";
import debounce from "lodash/debounce";
import {
  TExchange,
  TInterval,
  TSymbol,
  TlpPrice,
} from "#/types/price-chart.type";
import { useRHistoricalKlines } from "../services/historical-klines/useRHistoricalKline";
export interface ILineChart {
  value: number;
  time: Time;
}

type TTradingView = {
  exchange: TExchange;
  symbol: TSymbol;
  interval: TInterval;
  lpLinePrice: TlpPrice;
};

const calculateTimeOffset = (interval: string) => {
  let offset = 0;

  if (!isNaN(Number(interval))) {
    const minutes = Number(interval);
    offset = minutes * 60 * 1000 * 48;
  } else {
    switch (interval) {
      case "D":
        offset = 24 * 60 * 60 * 1000 * 48;
        break;
      case "W":
        offset = 7 * 24 * 60 * 60 * 1000 * 48;
        break;
      case "M":
        offset = 30 * 24 * 60 * 60 * 1000 * 48;
        break;
      default:
        offset = 24 * 60 * 60 * 1000 * 48;
    }
  }

  return offset;
};

const TradingViewChart: React.FC<TTradingView> = ({
  exchange,
  symbol,
  interval,
  lpLinePrice,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [chartData, setChartData] = useState<ILineChart[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const offset = calculateTimeOffset(interval);
  const [startTime, setStartTime] = useState(Date.now() - offset);
  const [endTime, setEndTime] = useState(Date.now());
  const socketUrl = "wss://stream.bybit.com/v5/public/spot";

  const {
    data: historicalData,
    isFetched,
    refetchWithParams,
  } = useRHistoricalKlines({
    exchange,
    symbol,
    interval,
    start: startTime.toString(),
    end: endTime.toString(),
  });

  useEffect(() => {
    const chartOptions = {
      layout: {
        fontFamily: "Fira Mono, monospace",
        fontSize: 9,
        textColor: "#A6A6A6",
        background: { color: "black" },
      },
      height: 240,
      grid: {
        vertLines: {
          color: "transparent",
        },
        horzLines: {
          style: 1,
          color: "#262626",
        },
      },

      timeScale: {
        rightOffset: 8,
        barSpacing: 15,
        timeVisible: true,
        secondsVisible: false,
        uniformDistribution: true,
      },

      leftPriceScale: {
        borderColor: "transparent",
      },
      rightPriceScale: {
        borderColor: "transparent",
      },
    };

    if (chartContainerRef.current) {
      chartRef.current = createChart(chartContainerRef.current, chartOptions);
      lineSeriesRef.current = chartRef.current.addLineSeries({
        priceLineVisible: false,
        color: "#FFCA43",
        lineWidth: 1,
      });

      const lpLine = {
        price: lpLinePrice,
        color: "#FFFFFFB3",
        lineWidth: 1 as LineWidth,
        lineStyle: 3,
        axisLabelVisible: true,
        axisLabelColor: "gray",
        title: "LP",
      };

      lineSeriesRef.current.createPriceLine(lpLine);
    }
  }, [lpLinePrice]);

  useEffect(() => {
    if (lineSeriesRef.current && isFetched && historicalData) {
      const sortedData = historicalData.sort(
        (a: IUnifiedKlineData, b: IUnifiedKlineData) => {
          const timeA = Number(a.openTime);
          const timeB = Number(b.openTime);
          return timeA - timeB;
        },
      );

      const formattedData = sortedData
        .map((kline: IUnifiedKlineData) => {
          const originalTimestamp = Math.floor(Number(kline.openTime) / 1000);
          if (isNaN(originalTimestamp)) {
            console.error("Invalid timestamp detected:", kline);
            return null;
          }

          const kstTimestamp = originalTimestamp + 9 * 60 * 60; // Korean time

          return {
            time: kstTimestamp as Time,
            value: parseFloat(kline.close),
          };
        })
        .filter((data) => data !== null);

      const combinedData = [...formattedData, ...chartData]
        .reduce((acc, curr) => {
          const existing = acc.find(
            (item: ILineChart) => item.time === curr.time,
          );
          if (!existing) {
            acc.push(curr);
          }
          return acc;
        }, [] as ILineChart[])
        .sort(
          (a: ILineChart, b: ILineChart) =>
            (a.time as number) - (b.time as number),
        );

      if (combinedData.length > 0) {
        setChartData(combinedData);
        lineSeriesRef.current.setData(combinedData);
      }
    }
  }, [isFetched, historicalData]);

  useEffect(() => {
    const socket = new Socket(socketUrl);

    socket.setReceiveCallback((message) => {
      if (message && message.data && message.data.length > 0) {
        const kline = message.data[0];
        const originalTimestamp = Math.floor(kline.timestamp / 1000);
        const kstTimestamp = originalTimestamp + 9 * 60 * 60;
        const alignedTime = Math.floor(kstTimestamp / 3600) * 3600;

        const formattedData = {
          time: alignedTime as Time,
          value: parseFloat(kline.close),
        };

        setChartData((prevData) => {
          const lastDataPoint = prevData[prevData.length - 1];
          if (lastDataPoint && lastDataPoint.time === formattedData.time) {
            const updatedData = [...prevData];
            updatedData[updatedData.length - 1] = formattedData;
            lineSeriesRef.current?.setData(updatedData);
            return updatedData;
          }

          const newData = [...prevData, formattedData];
          lineSeriesRef.current?.setData(newData);
          return newData;
        });
      }
    });

    socket.connect();
    socket.subscribe(`kline.${interval}.${symbol}`);

    return () => {
      socket.disconnect();
    };
  }, [interval, symbol]);

  const handleVisibleRangeChange = debounce(() => {
    if (isFetching) return;

    const logicalRange = chartRef.current?.timeScale().getVisibleLogicalRange();
    if (logicalRange && logicalRange.from < 0) {
      const newStartTime = startTime - offset;
      console.log(
        "Fetching earlier data:",
        new Date(newStartTime),
        "to",
        new Date(startTime),
      );
      setIsFetching(true);
      setStartTime(newStartTime);

      refetchWithParams(newStartTime, endTime).finally(() => {
        setIsFetching(false);
        setEndTime(startTime);
      });
    }
  }, 300);

  useEffect(() => {
    chartRef.current
      ?.timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    return () => {
      chartRef.current
        ?.timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    };
  }, [startTime, isFetching]);

  return (
    <div className="">
      <div ref={chartContainerRef} />
    </div>
  );
};

export default TradingViewChart;
