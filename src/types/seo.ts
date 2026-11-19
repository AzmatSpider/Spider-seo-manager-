export type VideoType = 'YouTube Shorts' | 'YouTube Long Video';

export type SeoLanguage = 'English' | 'Hindi' | 'Hinglish';

export type MinecraftEdition = 'Java' | 'Bedrock' | 'Both';

export type AppView = 'dashboard' | 'generator' | 'settings';

export interface SeoGenerateInput {
  topic: string;
  videoType: VideoType;
  language: SeoLanguage;
  edition: MinecraftEdition;
  details: string;
  creatorCredit: string;
}

export interface SeoOutput {
  title: string;
  descriptionWithHashtags: string;
  keywords: string;
  tags: string;
  seoTips: string;
}

export interface SavedSeoPack {
  id: string;
  createdAt: number;
  updatedAt: number;
  input: SeoGenerateInput;
  output: SeoOutput;
}
