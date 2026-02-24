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
          id: '../../docs-site/docs/api/classes/ApiTestHarness',
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
          id: '../../docs-site/docs/api/interfaces/ApiTestHarnessConstructProps',
          label: 'ApiTestHarnessConstructProps',
        },
      ],
    },
  ],
};
module.exports = typedocSidebar.items;
