module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module-resolver",
        {
          "root": ["./"],
          "alias": {
            "@mobile": "./src",
            "@core": "../packages/core/src"
          },
          "extensions": [".ts", ".tsx", ".js", ".json"]
        }
      ]
    ],
  };
};
