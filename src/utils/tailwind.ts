const pxToRem = (px: number, base = 16) => `${px / base}rem`;

type PxToRemMap = {
  [key: number]: string;
};

export const generatePxToRemMapping = (): PxToRemMap =>
  Array.from({ length: 200 }, (_, index) => index + 1).reduce<PxToRemMap>(
    (accumulator, currentPx) => {
      accumulator[currentPx] = pxToRem(currentPx);
      return accumulator;
    },
    {},
  );
