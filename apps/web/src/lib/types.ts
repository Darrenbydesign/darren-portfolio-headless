export interface StrapiMedia {
  id?: number;
  documentId?: string;
  url?: string;
  alternativeText?: string | null;
  caption?: string | null;
  mime?: string;
  width?: number | null;
  height?: number | null;
  attributes?: StrapiMedia;
  data?: StrapiMedia | null;
}

export interface RichTextNode {
  type?: string;
  text?: string;
  level?: number;
  format?: "ordered" | "unordered";
  url?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  image?: StrapiMedia;
  children?: RichTextNode[];
}

export interface HeroMetaItem {
  id?: number;
  label?: string;
}

export interface Author {
  id?: number;
  documentId?: string;
  name?: string;
}

export interface Category {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
}

export interface DetailStat {
  id?: number;
  label?: string;
  value?: string;
}

export interface ProgressItem {
  id?: number;
  label?: string;
  percentage?: number;
}

export interface ExternalImage {
  url?: string;
  alt?: string;
  caption?: string;
}

export interface ContentBlock {
  id?: number;
  __component?: string;
  body?: RichTextNode[] | string;
  title?: string;
  file?: StrapiMedia;
  captions?: StrapiMedia;
  captionsLanguage?: string;
  captionsLabel?: string;
  transcript?: RichTextNode[];
  files?: StrapiMedia[] | { data?: StrapiMedia[] };
  images?: ExternalImage[];
  url?: string;
  alt?: string;
  caption?: string;
}

interface BaseEntry {
  id?: number;
  documentId?: string;
  title: string;
  slug: string;
  coverSize?: string;
  datePublished?: string;
  publishedAt?: string;
}

export interface BlogPost extends BaseEntry {
  blogPostCover?: StrapiMedia;
  author?: Author;
  category?: Category;
  content?: RichTextNode[];
  contentBlocks?: ContentBlock[];
  excerpt?: string;
  media?: StrapiMedia[];
}

export interface CaseStudy extends BaseEntry {
  caseStudyCover?: StrapiMedia;
  heroMeta?: HeroMetaItem[];
  projectStats?: DetailStat[];
  description?: ContentBlock[];
  media?: StrapiMedia[];
  challenge?: ContentBlock[];
  solution?: ContentBlock[];
  results?: ContentBlock[];
  tools?: RichTextNode[];
  deliverableProgress?: ProgressItem[];
}
