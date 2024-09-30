// 'use client'

// import LineChart from "#/components/line-chart";
// import { data } from "#/data/line-chart";
// import { useEffect, useState } from "react";
// import Socket from "../services/socket";

// export default function PriceChart() {

//   const [klineData, setKlineData] = useState(null);
//   const socketUrl = 'wss://stream.bybit.com/v5/public/spot';
//   const symbol = 'BTCUSDT';

//   useEffect(() => {
//     const socket = new Socket(socketUrl);

//     socket.setReceiveCallback((message) => {
//       console.log('Received data:', message);
//       setKlineData(message);
//     });

//     socket.connect();

//     socket.subscribe(`kline.60.${symbol}`);
//     socket.subscribe(`publicTrade.${symbol}`);

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   console.log(klineData)

//   return (
//     <section className="w-[37.56rem] desktop:w-[20rem] px-6 py-6 flex flex-col items-center">
//       <div className="w-full flex justify-between mb-[1.13rem]">
//         <span className="font-bold text-base">BTC-USDT</span>
//         <span className="text-[0.625rem] font-500">
//           Liquidation Price : 54330.03
//         </span>
//       </div>
//       <div className="w-full">
//         <LineChart data={data} lpValue={52000.5} latestValue={58000.9} />
//       </div>
//       <div className="w-full flex text-[0.625rem] gap-7 mt-[1.69rem]">
//         <div className="flex gap-3">
//           <span className="font-bold text-gray-100">USDT</span>
//           <span className="text-white">90,000,000 USDT</span>
//         </div>
//         <div className="flex gap-3 justify-start">
//           <span className="font-bold text-gray-100">TOKEN</span>
//           <span className="text-white">12,000,000 BTC (812,390,000 USDT)</span>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import LineChart, { ILineChart } from "#/components/line-chart";
import { useEffect, useState } from "react";
import Socket from "../services/socket";
import { data } from "../data/line-chart";

const convertTimestampToTime = (timestamp: number) => {
  const date = new Date(timestamp);

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function PriceChart() {
  const [chartData, setChartData] = useState<ILineChart[]>([]);
  const socketUrl = "wss://stream.bybit.com/v5/public/spot";
  const symbol = "BTCUSDT";

  useEffect(() => {
    const socket = new Socket(socketUrl);

    socket.setReceiveCallback((message) => {
      if (message && message.data && message.data.length > 0) {
        const kline = message.data[0];

        const formattedData = {
          time: convertTimestampToTime(kline.start),
          value: parseFloat(kline.close),
        };
        console.log(kline);
        setChartData((prevData) => [...prevData, formattedData]);
      }
    });

    socket.connect();
    socket.subscribe(`kline.60.${symbol}`);

    return () => {
      socket.disconnect();
    };
  }, []);

  // console.log(chartData)

  return (
    <section className="w-[37.56rem] desktop:w-[20rem] px-6 py-6 flex flex-col items-center">
      <div className="w-full flex justify-between mb-[1.13rem]">
        <span className="font-bold text-base">BTC-USDT</span>
        <span className="text-[0.625rem] font-500">
          Liquidation Price : 54330.03
        </span>
      </div>
      <div className="w-full h-[256px]">
        <LineChart data={chartData} lpValue={52000.5} latestValue={58000.9} />
        {/* <LineChart data={data} lpValue={52000.5} latestValue={58000.9} />  */}
      </div>
      <div className="w-full flex text-[0.625rem] gap-7 mt-[1.69rem]">
        <div className="flex gap-3">
          <span className="font-bold text-gray-100">USDT</span>
          <span className="text-white">90,000,000 USDT</span>
        </div>
        <div className="flex gap-3 justify-start">
          <span className="font-bold text-gray-100">TOKEN</span>
          <span className="text-white">12,000,000 BTC (812,390,000 USDT)</span>
        </div>
      </div>
    </section>
  );
}
