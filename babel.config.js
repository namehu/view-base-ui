module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  "plugins": [
    [
      "import",
      {
        "libraryName": "view-base-ui",
        "libraryDirectory": "src/components"
      }
    ],
  ]
}
