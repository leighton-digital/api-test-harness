// @ts-check
/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: 'category',
      label: 'Classes',
      items: [
        {
          type: 'doc',
          id: '../api/classes/ApiTestHarness',
          label: 'ApiTestHarness',
        },
      ],
    },
    {
      type: 'category',
      label: 'Interfaces',
      items: [
        {
          type: 'doc',
          id: '../api/interfaces/ApiTestHarnessConstructProps',
          label: 'ApiTestHarnessConstructProps',
        },
      ],
    },
  ],
};
module.exports = typedocSidebar.items;
