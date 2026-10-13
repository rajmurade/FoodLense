import { SIMULATED_TEST_LABEL } from './simulated';

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
  steps: {
    progressLabel: 'Progress',
    labels: ['Barcode', 'Product', 'Label', 'Review', 'Result'],
    stepTemplate: 'Step {n} of 5',
  },
  product: {
    loading: 'Loading product record…',
    sourceLabel: 'Source: Open Food Facts (community data)',
    retrievedLabel: 'Retrieved',
    barcodeLabel: 'Barcode',
    ingredientsHeading: 'Ingredients (from database)',
    unavailable: 'Not available',
    ingredientsUnavailable: 'Not available in this record',
    caveat: 'A database record does not prove this pack is genuine.',
    notFoundTitle: 'Not in the database.',
    notFoundBody:
      'This is common for local products. You can still photograph the label; the result will be Insufficient evidence.',
    noIngredients:
      'This record has no ingredient list. The comparison will return Insufficient evidence.',
    next: 'Next: photograph the ingredient list',
    continueWithoutRecord: 'Continue without record',
    retry: 'Retry',
  },
  label: {
    takePhoto: 'Take photo',
    uploadImage: 'Upload image',
    retake: 'Retake',
    previewAlt: 'Preview of the selected ingredient panel photo',
    readText: 'Read text',
    privacyNote: 'The photo stays on your device. It is never uploaded.',
    reviewHeading: 'Review the text we read',
    reviewHint: 'Fix any wrong words before comparing.',
    textareaLabel: 'Ingredient list text',
    placeholder:
      'The ingredients will appear here after reading. You can also type them in yourself.',
    compare: 'Compare',
    chooseFirst: 'Choose or take a photo first.',
    needText: 'Read or type some ingredient text before comparing.',
    lowConfidenceWarning:
      'The reading confidence is low. Check the words carefully or retake the photo.',
    errors: {
      empty: 'That file looks empty. Please choose a photo.',
      tooLarge: 'That image is larger than 5 MB. Please choose a smaller photo.',
      unsupported: 'Please choose a JPEG, PNG or WebP image.',
      readFailed: 'We could not read this image. You can type the ingredients yourself.',
      prepareFailed: 'We could not prepare this image. You can type the ingredients yourself.',
    },
    progress: {
      PREPARING: 'Preparing the text reader…',
      CORE: 'Loading the text reader…',
      LANGUAGE: 'Loading English text data…',
      INITIALIZE: 'Getting ready to read…',
      RECOGNIZE: 'Reading the text…',
    },
    progressLabel: 'Reading progress',
  },
  confidence: {
    label: 'Reading confidence',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  },
  simulated: {
    label: SIMULATED_TEST_LABEL,
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
