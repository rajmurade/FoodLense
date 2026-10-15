export interface OfficialChannel {
  id: string;
  label: string;
  value: string;
  href: string;
  note?: string;
}

export const officialChannels = {
  fssaiHelpline: {
    id: 'fssai-helpline',
    label: 'FSSAI helpline',
    value: '1800-112-100',
    href: 'tel:1800112100',
    note: '24x7',
  },
  consumerHelpline: {
    id: 'consumer-helpline',
    label: 'National Consumer Helpline',
    value: '1915',
    href: 'tel:1915',
  },
  foodSafetyConnect: {
    id: 'food-safety-connect',
    label: 'Food Safety Connect',
    value: 'FoSCoS consumer grievance',
    href: 'https://foscos.fssai.gov.in/consumergrievance',
  },
} satisfies Record<string, OfficialChannel>;

export interface ResourceCard {
  id: string;
  title: string;
  source: string;
  href: string;
  kind: 'article' | 'video';
}

export const labelArticles: ResourceCard[] = [
  {
    id: 'fssai-blog',
    title: 'How to read the information on a food pack',
    source: 'FSSAI',
    href: 'https://blogs.fssai.gov.in/blog8.php',
    kind: 'article',
  },
  {
    id: 'eat-right-label',
    title: 'Reading a label, step by step',
    source: 'Eat Right India',
    href: 'https://eatrightindia.gov.in/how-to-read-label.jsp',
    kind: 'article',
  },
  {
    id: 'vikaspedia-labels',
    title: 'Food labels and healthier food choices',
    source: 'Vikaspedia',
    href: 'https://vikaspedia.in/health/nutrition/dietary-guidelines-1/food-labels-and-healthy-food-choices',
    kind: 'article',
  },
  {
    id: 'cag-label',
    title: "What's on a food label: a consumer guide",
    source: 'Consumer Association of India',
    href: 'https://www.cag.org.in/newsletters/public-newsense/whats-label',
    kind: 'article',
  },
  {
    id: 'fssai-compendium',
    title: 'FSSAI labelling and display compendium (PDF)',
    source: 'FSSAI',
    href: 'https://www.fssai.gov.in/upload/uploadfiles/files/Compendium_Labelling_Display_23_09_2021.pdf',
    kind: 'article',
  },
];

export const learnVideos: ResourceCard[] = [
  {
    id: 'youtube-read-label',
    title: 'Search videos on reading a food label',
    source: 'YouTube',
    href: 'https://www.youtube.com/results?search_query=FSSAI+how+to+read+food+label',
    kind: 'video',
  },
  {
    id: 'youtube-har-label',
    title: 'Search videos from the "Har Label Kuch Kehta Hai" campaign',
    source: 'YouTube',
    href: 'https://www.youtube.com/results?search_query=Har+Label+Kuch+Kehta+Hai',
    kind: 'video',
  },
];

export const externalResourcesNotice = 'External resources. Not run by FoodCheck.';
