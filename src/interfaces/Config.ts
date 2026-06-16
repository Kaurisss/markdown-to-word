export interface ElementStyle {
  fontFamily?: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline?: boolean;
  strike?: boolean;
  lineSpacing: number | string;
  spaceBefore: number;
  spaceAfter: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  firstLineIndent: number;
  backgroundColor?: string;
}

export interface DocumentConfig {
  global: {
    pageMargin: number;
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
