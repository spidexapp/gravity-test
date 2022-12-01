import type { DeepPartial, Theme } from "@chakra-ui/react";

/** extend additional color here */
const extendedColors: DeepPartial<
  Record<string, Theme["colors"]["blackAlpha"]>
> = {
  spxGray: {
    100: "#101213",
    200: "#17191a",
    300: "#232529",
    400: "#3f4147",
    500: "#646871",
    600: "#90949e",
    700: "#b8bdc7",
    800: "#d9dde5",
    900: "#f1f3f7",
  },
  spxGrayButton: {
    100: "#131416",
    200: "#232529",
    300: "#3f4147",
    400: "#646871",
    500: "#90949e",
    600: "#b8bdc7",
  },
};

/** override chakra colors here */
const overridenChakraColors: DeepPartial<Theme["colors"]> = {};

export const colors = {
  ...overridenChakraColors,
  ...extendedColors,
};
