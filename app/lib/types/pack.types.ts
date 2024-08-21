import type {Settings} from '~/settings';

import type {AspectRatio, ColorHexCode} from './general.types';

export interface ProductCms {
  handle: string;
}

export interface ImageCms {
  altText?: string;
  aspectRatio?: number;
  directory?: string;
  filename?: string;
  format?: string;
  height?: number;
  id?: string;
  previewSrc?: string;
  size?: number;
  src: string;
  type?: string;
  width?: number;
}

export interface LinkCms {
  url: string;
  text: string;
  newTab: boolean;
  isExternal: boolean;
  type: 'isPage' | 'isExternal' | 'isEmail' | 'isPhone';
}

export interface Swatch {
  name: string;
  color: ColorHexCode;
  image: ImageCms;
}

export interface SwatchesMap {
  [key: string]: Swatch;
}

export interface Swatches {
  swatchesMap: SwatchesMap;
  swatchOptionName: string;
}

export type AspectRatioType = 'native' | 'manual';

export type Crop = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface Seo {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  noFollow?: boolean;
  noIndex?: boolean;
}

export interface Section {
  id: string;
  title: string;
  status: string;
  data: Record<string, any>;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  parentContentType: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

export interface Template {
  id: string;
  title: string;
  type: string;
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type Page = {
  id: string;
  title: string;
  handle: string;
  description: string;
  status: string;
  seo: Seo;
  sections: {
    nodes: Section[];
    pageInfo: PageInfo;
  };
  template: Template;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type {Settings};

export interface SiteSettings {
  createdAt: string;
  favicon: string | null;
  id: string;
  publishedAt: string;
  seo: Seo;
  settings: Settings;
  status: string;
  updatedAt: string;
}

export interface RootSiteSettings {
  data: {
    siteSettings: SiteSettings;
  };
  error: string | null;
}

export interface Status {
  started: boolean;
  finished: boolean;
  success: boolean;
}
