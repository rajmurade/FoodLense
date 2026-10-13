export const uiStrings = {
  app: {
    name: 'FoodCheck',
    tagline: 'Check your food label. Stay informed.',
  },
  nav: {
    primaryLabel: 'Primary',
    tabsLabel: 'Sections',
    home: 'Home',
    scan: 'Scan',
    guide: 'Guide',
    history: 'History',
    about: 'About',
    back: 'Back',
  },
  a11y: {
    skipToContent: 'Skip to content',
    logoLabel: 'FoodCheck home',
  },
  footer: {
    disclaimer:
      'FoodCheck compares labels with database records. It is not a lab test and cannot confirm a food is safe or genuine.',
    helpLabel: 'Help',
  },
  result: {
    disclaimer: 'This does not confirm the product is genuine or safe.',
  },
  pages: {
    homeTitle: 'FoodCheck',
    scanTitle: 'Scan a barcode',
    productTitle: 'Product record',
    labelTitle: 'Photograph the ingredient list',
    resultTitle: 'Comparison result',
    guideTitle: 'How to read a label',
    historyTitle: 'Recent scans',
    aboutTitle: 'About FoodCheck',
    notFoundTitle: 'Page not found',
    placeholder: 'This screen will be built in a later step.',
  },
} as const;

export type UiStrings = typeof uiStrings;
