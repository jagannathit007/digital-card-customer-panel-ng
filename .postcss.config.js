module.exports = {
  plugins: [
    require("postcss-prefixwrap")(".tailwind-section", { files: ["tailwind"] }),
    require("postcss-prefixwrap")(".bootstrap-section", {
      files: ["bootstrap"],
    }),
  ],
};
