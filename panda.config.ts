import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        fonts: {
          line: { value: "var(--font-line)" },
          udev: { value: "var(--font-udev)" },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "panda",
  jsxFramework: "react",

  dependencies: ["*"],
});
