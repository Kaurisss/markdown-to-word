export interface ElementStyle {
  fontFamily?: string;
  fontFamilyEn?: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  lineSpacing: number | string;
  spaceBefore: number;
  spaceAfter: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  firstLineIndent: number;
  backgroundColor?: string;
}

export interface PageMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageSize {
  width: number;
  height: number;
  unit?: 'in' | 'cm';
}

export interface HeaderConfig {
  enabled: boolean;
  text: string;
  distance: number;
  fontFamily?: string;
  fontFamilyEn?: string;
  fontSize: number;
  bold?: boolean;
  alignment: 'left' | 'center' | 'right';
}

export interface FooterConfig {
  enabled: boolean;
  pageNumber: boolean;
  format: string;
  distance: number;
  fontFamily?: string;
  fontFamilyEn?: string;
  fontSize: number;
  bold?: boolean;
  alignment: 'left' | 'center' | 'right';
  startAtBody?: boolean;
}

export interface TableOfContentsConfig {
  maxLevel?: number;
  titleStyle?: Partial<ElementStyle>;
  levelStyles?: Record<string, Partial<ElementStyle>>;
}

export interface BodyStartConfig {
  firstHeadingAsTitle?: boolean;
  restartPageNumberAfterToc?: boolean;
  pageNumberStart?: number;
}

export type ConfigStyleKey = 'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote' | 'documentTitle' | 'table' | 'caption';

export interface DocumentConfig {
  global: {
    pageMargin: number | PageMargin;
    pageSize?: PageSize;
    baseFontCn: string;
    baseFontEn: string;
    horizontalRule: 'default' | 'page_break' | 'hidden';
    includeTableOfContents: boolean;
    header?: HeaderConfig;
    footer?: FooterConfig;
    tableOfContents?: TableOfContentsConfig;
    bodyStart?: BodyStartConfig;
    tableHeaderBold?: boolean;
    normalizePunctuation?: boolean;
  };
  imageCaption: {
    useAltText: boolean;
    autoNumber: boolean;
  };
  styles: {
    documentTitle?: ElementStyle;
    h1: ElementStyle;
    h2: ElementStyle;
    h3: ElementStyle;
    body: ElementStyle;
    code: ElementStyle;
    quote: ElementStyle;
    table?: ElementStyle;
    caption?: ElementStyle;
  };
}
