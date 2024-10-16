import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineWidth, Time } from "lightweight-charts";
import debounce from "lodash/debounce";
import { useRHistoricalKlines } from "#/services/historical-klines/useRHistoricalKline";
import { usePriceChartContext } from "#/providers/price-chart/context";
import { useQuery } from "@tanstack/react-query";
import { TInterval, TSelectedInterval, TSymbol } from "#/types/price-chart.type";
import { TExchange } from "#/types/exchange.type";

export interface ILineChart {
  value: number;
  time: Time;
}

interface IKlineWebsocket {
  time: number;
  close: string;
}

type TTradingView = {
  exchange: TExchange;
  symbol: TSymbol;
  interval: TInterval;
  lpLinePrice: number;
  offsetInterval: TSelectedInterval;
};

const calculateTimeOffset = (offsetInterval: TSelectedInterval) => {
  const offsets = {
    one_hour: 60 * 60 * 1000 * 48,
    four_hour: 4 * 60 * 60 * 1000 * 48,
    day: 24 * 60 * 60 * 1000 * 48,
    week: 7 * 24 * 60 * 60 * 1000 * 48,
  };
  return offsets[offsetInterval] || offsets['one_hour'];
};

const TradingViewChart: React.FC<TTradingView> = ({
  lpLinePrice,
  offsetInterval,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [chartData, setChartData] = useState<ILineChart[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const { socketInstance, symbol, exchange, interval } = usePriceChartContext();

  const offset = calculateTimeOffset(offsetInterval);
  const [startTime, setStartTime] = useState(Date.now() - offset);
  const [endTime, setEndTime] = useState(Date.now());

  // Fetch historical klines using React Query
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

  // Setup chart
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
    const offset = calculateTimeOffset(offsetInterval);
    setStartTime(Date.now() - offset);
    setEndTime(Date.now());
    setChartData([]);
    // Clear existing data in the chart series
    if (lineSeriesRef.current) {
      lineSeriesRef.current.setData([]);
    }
  }, [interval, socketInstance, symbol]);

  // Process historical data when fetched
  useEffect(() => {
    if (lineSeriesRef.current && isFetched && historicalData) {
      const sortedData = historicalData.sort(
        (a: { openTime: number }, b: { openTime: number }) =>
          a.openTime - b.openTime,
      );

      const formattedData = sortedData
        .map((kline: { openTime: number; close: string }) => {
          // Convert to  Koran time
          const originalTimestamp = Math.floor(kline.openTime / 1000);
          const kstTimestamp = originalTimestamp + 9 * 60 * 60;
          const alignedTime = Math.floor(kstTimestamp / 3600) * 3600;
          return {
            time: alignedTime as Time,
            value: parseFloat(kline.close),
          };
        })
        .filter(
          (item: ILineChart) =>
            !isNaN(item.time as number) && !isNaN(item.value),
        );

      // Combine data, avoid duplicates, and ensure sorted order
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
        lineSeriesRef.current.setData(combinedData); // Ensure data is sorted
      }
    }
  }, [isFetched, historicalData]);

  const handleVisibleRangeChange = debounce(() => {
    if (isFetching) return;
    const logicalRange = chartRef.current?.timeScale().getVisibleLogicalRange();
    if (logicalRange && logicalRange.from < 0) {
      const newStartTime = startTime - offset;
      setIsFetching(true);
      setStartTime(newStartTime);

      refetchWithParams(newStartTime.toString(), endTime.toString());
      setIsFetching(false);
      setEndTime(startTime);
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


  const { data: klineData } = useQuery<IKlineWebsocket>({
    queryKey: [exchange, symbol, interval],
    staleTime: Infinity, 
    enabled: !!symbol && !!interval, 
  });


  useEffect(() => {
    if (!klineData) return;
    const kline = klineData;
    const originalTimestamp = Math.floor(kline.time);
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

       // Ensure new data is in ascending order by time
      if (lastDataPoint && formattedData.time < lastDataPoint.time) {
        return prevData; // Ignore out-of-order data
      }
    
      const newData = [...prevData, formattedData];
      lineSeriesRef.current?.setData(newData);
      return newData;
    });
  }, [klineData]);

  return <div ref={chartContainerRef} />;
};

export default TradingViewChart;
