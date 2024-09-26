import LineChart from "#/components/line-chart";
import { data } from "#/data/line-chart";

export default function PriceChart() {
  return (
    <section className="w-[37.56rem]  py-6 flex flex-col items-center">
      <div className="w-[560px] flex justify-between mb-[1.13rem]">
        <span className="font-bold text-base">BTC-USDT</span>
        <span className="text-[0.625rem] font-500">
          Liquidation Price : 54330.03
        </span>
      </div>
      <LineChart
        width={560}
        height={256}
        data={data}
        LpValue={52000.5}
        LatestValue={58000.9}
      />
      <div className="w-[560px] flex text-[0.625rem] gap-7 mt-[1.69rem]">
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
