import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  UnderlineType,
  LevelFormat,
  AlignmentType,
  ShadingType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { MdNode } from '../types';

// Constants for styling
const FONT_FAMILY_Main = "Microsoft YaHei"; // 中文字体
const FONT_FAMILY_Mono = "Courier New";
const COLOR_CODE_BG = "F3F4F6";
const TABLE_BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "D1D5DB"
};

interface TransformContext {
  listOrdered?: boolean;
  bold?: boolean;
  italics?: boolean;
  isLink?: boolean;
  inBlockquote?: boolean;
  inListItem?: boolean;
  inTableHeader?: boolean;
}

/**
 * 从节点中提取纯文本内容（用于表格单元格等简单场景）
 */
const extractText = (node: MdNode): string => {
  if (node.type === 'text') return node.value || '';
  if (node.type === 'inlineCode') return node.value || '';
  if (node.children) return node.children.map(extractText).join('');
  return '';
};

/**
 * 将 Markdown AST 节点转换为 docx 对象
 */
const transformNode = (node: MdNode, context: TransformContext = {}): any[] => {
  // 递归处理子节点
  const processChildren = (overrideContext: Partial<TransformContext> = {}): any[] => {
    if (!node.children) return [];
    const newContext = { ...context, ...overrideContext };
    return node.children.flatMap(child => transformNode(child, newContext));
  };

  switch (node.type) {
    case 'root':
      return processChildren();

    case 'heading':
      const headingLevels: Record<number, any> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };

      const headingRuns = processChildren({ bold: false, italics: false, isLink: false });

      return [
        new Paragraph({
          heading: headingLevels[node.depth || 1],
          children: headingRuns,
          spacing: {
            before: 240,
            after: 120,
          },
        })
      ];

    case 'paragraph':
      const paragraphChildren = processChildren({ bold: false, italics: false, isLink: false });

      const paraOptions: any = {
        children: paragraphChildren,
        spacing: { before: 120, after: 120 }
      };

      if (context.inBlockquote) {
        paraOptions.indent = { left: 720 };
        paraOptions.border = { left: { color: "9CA3AF", space: 120, style: "single", size: 24 } };
      }

      if (context.inListItem) {
        if (context.listOrdered) {
          paraOptions.numbering = { reference: "default-numbering", level: 0 };
        } else {
          paraOptions.bullet = { level: 0 };
        }
      }

      return [new Paragraph(paraOptions)];

    case 'text':
      return [new TextRun({
        text: node.value || '',
        font: FONT_FAMILY_Main,
        bold: context.bold || context.inTableHeader,
        italics: context.italics,
        color: context.isLink ? "0563C1" : undefined,
        underline: context.isLink ? { type: UnderlineType.SINGLE, color: "0563C1" } : undefined,
      })];

    case 'emphasis':
      return processChildren({ italics: true });

    case 'strong':
      return processChildren({ bold: true });

    case 'inlineCode':
      return [new TextRun({
        text: node.value || '',
        font: FONT_FAMILY_Mono,
        color: "C7254E",
        shading: {
          fill: "F9F2F4",
          type: ShadingType.CLEAR,
          color: "auto"
        }
      })];

    case 'code':
      // 代码块：按行分割，每行一个段落
      const codeLines = (node.value || '').split('\n');
      return codeLines.map(line =>
        new Paragraph({
          children: [
            new TextRun({
              text: line || ' ', // 空行至少一个空格
              font: FONT_FAMILY_Mono,
              size: 20, // 10pt
            })
          ],
          shading: {
            fill: COLOR_CODE_BG,
            color: "auto",
          },
          spacing: { before: 0, after: 0, line: 240 },
          indent: { left: 240 }
        })
      );

    case 'blockquote':
      return processChildren({ inBlockquote: true });

    case 'list':
      return processChildren({ listOrdered: node.ordered });

    case 'listItem':
      return processChildren({ inListItem: true });

    case 'link':
      const linkRuns = processChildren({ isLink: true });
      return [
        new ExternalHyperlink({
          children: linkRuns,
          link: node.url || ''
        })
      ];

    // 表格支持
    case 'table':
      if (!node.children) return [];

      const tableRows = node.children.map((rowNode, rowIndex) => {
        if (rowNode.type !== 'tableRow' || !rowNode.children) {
          return null;
        }

        const isHeader = rowIndex === 0;
        const cells = rowNode.children.map(cellNode => {
          const cellText = extractText(cellNode);
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cellText,
                    font: FONT_FAMILY_Main,
                    bold: isHeader,
                    size: 22, // 11pt
                  })
                ],
                spacing: { before: 60, after: 60 }
              })
            ],
            shading: isHeader ? { fill: "F3F4F6", type: ShadingType.CLEAR, color: "auto" } : undefined,
            borders: {
              top: TABLE_BORDER,
              bottom: TABLE_BORDER,
              left: TABLE_BORDER,
              right: TABLE_BORDER,
            }
          });
        });

        return new TableRow({ children: cells });
      }).filter(Boolean) as TableRow[];

      if (tableRows.length === 0) return [];

      return [
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      ];

    case 'tableRow':
    case 'tableCell':
      // 这些由 table 节点统一处理
      return [];

    // 分隔线
    case 'thematicBreak':
      return [
        new Paragraph({
          children: [],
          border: {
            bottom: { color: "E5E7EB", space: 1, style: "single", size: 6 }
          },
          spacing: { before: 240, after: 240 }
        })
      ];

    // 删除线
    case 'delete':
      return node.children?.flatMap(child =>
        transformNode(child, context).map(run => {
          if (run instanceof TextRun) {
            return new TextRun({
              text: extractText(child),
              font: FONT_FAMILY_Main,
              strike: true
            });
          }
          return run;
        })
      ) || [];

    // 硬换行
    case 'break':
      return [new TextRun({ text: '', break: 1 })];

    // HTML 节点跳过
    case 'html':
      return [];

    default:
      console.warn(`未处理的 Markdown 节点类型: ${node.type}`);
      return processChildren();
  }
};

/**
 * 将 Markdown 字符串转换为 Word 文档 Blob
 */
export const generateDocxBlob = async (markdown: string): Promise<Blob> => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm);

  const ast = processor.parse(markdown) as MdNode;
  const docChildren = transformNode(ast);

  // 过滤掉空数组和无效内容
  const validChildren = docChildren.flat().filter(Boolean);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 260 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: validChildren,
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: {
            font: FONT_FAMILY_Main,
            size: 24, // 12pt
          },
          paragraph: {
            spacing: { line: 360 }
          }
        },
        {
          id: "Heading1",
          name: "Heading 1",
          run: {
            font: FONT_FAMILY_Main,
            size: 40, // 20pt
            bold: true,
            color: "0284C7"
          },
          paragraph: {
            spacing: { before: 240, after: 120 }
          }
        },
        {
          id: "Heading2",
          name: "Heading 2",
          run: {
            font: FONT_FAMILY_Main,
            size: 32, // 16pt
            bold: true,
            color: "0284C7"
          },
          paragraph: {
            spacing: { before: 240, after: 120 }
          }
        },
        {
          id: "Heading3",
          name: "Heading 3",
          run: {
            font: FONT_FAMILY_Main,
            size: 28, // 14pt
            bold: true,
            color: "0284C7"
          },
          paragraph: {
            spacing: { before: 240, after: 120 }
          }
        }
      ]
    }
  });

  return await Packer.toBlob(doc);
};