import { timeParse } from "d3-time-format";
import { ILineChart } from "#/components/line-chart";

interface Dimensions {
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  boundedWidth: number;
  boundedHeight: number;
}

function getDimensions({
  width,
  height,
}: {
  width: number;
  height: number;
}): Dimensions {
  const margin = {
    top: 10,
    right: 80,
    bottom: 30,
    left: 15,
  };

  return {
    margin,
    boundedWidth: width - margin.left - margin.right,
    boundedHeight: height - margin.top - margin.bottom,
  };
}

const yAccessor = (d: ILineChart) => d.value;
const xAccessor = (d: ILineChart) => timeParse("%H:%M")(d.time) as Date;

export { getDimensions, yAccessor, xAccessor };
