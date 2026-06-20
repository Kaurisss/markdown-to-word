export interface ElementStyle {
  fontFamily?: string;
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

export interface DocumentConfig {
  global: {
    pageMargin: number | PageMargin;
    baseFontCn: string;
    baseFontEn: string;
    horizontalRule: 'default' | 'page_break' | 'hidden';
    includeTableOfContents: boolean;
  };
  styles: {
    h1: ElementStyle;
    h2: ElementStyle;
    h3: ElementStyle;
    body: ElementStyle;
    code: ElementStyle;
    quote: ElementStyle;
  };
}
