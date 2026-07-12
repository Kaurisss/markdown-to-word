import { z } from 'zod';
import {
  BodyStartConfig,
  DocumentConfig,
  ElementStyle,
  FooterConfig,
  HeaderConfig,
  PageMargin,
  PageSize,
  TableOfContentsConfig,
} from '../types/config';
import { DEFAULT_CONFIG } from './defaultConfig';

const alignmentSchema = z.enum(['left', 'center', 'right', 'justify']);
const horizontalRuleSchema = z.enum(['default', 'page_break', 'hidden']);
const headerFooterAlignmentSchema = z.enum(['left', 'center', 'right']);

const numberSchema = z.number().finite();
const lineSpacingSchema = z.union([numberSchema, z.string()]);

const elementStyleSchema = z.object({
  fontFamily: z.string().optional(),
  fontFamilyEn: z.string().optional(),
  fontSize: numberSchema,
  color: z.string(),
  bold: z.boolean(),
  italic: z.boolean(),
  lineSpacing: lineSpacingSchema,
  spaceBefore: numberSchema,
  spaceAfter: numberSchema,
  alignment: alignmentSchema,
  firstLineIndent: numberSchema,
  backgroundColor: z.string().optional(),
}).strict();

const pageMarginSchema = z.object({
  top: numberSchema,
  bottom: numberSchema,
  left: numberSchema,
  right: numberSchema,
}).strict();

const pageSizeSchema = z.object({
  width: numberSchema,
  height: numberSchema,
  unit: z.enum(['in', 'cm']).optional(),
}).strict();

const headerConfigSchema = z.object({
  enabled: z.boolean(),
  text: z.string(),
  distance: numberSchema,
  fontFamily: z.string().optional(),
  fontFamilyEn: z.string().optional(),
  fontSize: numberSchema,
  bold: z.boolean().optional(),
  alignment: headerFooterAlignmentSchema,
}).strict();

const footerConfigSchema = z.object({
  enabled: z.boolean(),
  pageNumber: z.boolean(),
  format: z.string(),
  distance: numberSchema,
  fontFamily: z.string().optional(),
  fontFamilyEn: z.string().optional(),
  fontSize: numberSchema,
  bold: z.boolean().optional(),
  alignment: headerFooterAlignmentSchema,
  startAtBody: z.boolean().optional(),
}).strict();

const tableOfContentsConfigSchema = z.object({
  maxLevel: numberSchema.optional(),
  titleStyle: elementStyleSchema.partial().strict().optional(),
  levelStyles: z.record(
    z.string(),
    elementStyleSchema.partial().strict(),
  ).optional(),
}).strict();

const bodyStartConfigSchema = z.object({
  firstHeadingAsTitle: z.boolean().optional(),
  restartPageNumberAfterToc: z.boolean().optional(),
  pageNumberStart: numberSchema.optional(),
}).strict();

const globalConfigSchema = z.object({
  pageMargin: z.union([numberSchema, pageMarginSchema]),
  pageSize: pageSizeSchema.optional(),
  baseFontCn: z.string(),
  baseFontEn: z.string(),
  horizontalRule: horizontalRuleSchema,
  includeTableOfContents: z.boolean(),
  header: headerConfigSchema.optional(),
  footer: footerConfigSchema.optional(),
  tableOfContents: tableOfContentsConfigSchema.optional(),
  bodyStart: bodyStartConfigSchema.optional(),
  tableHeaderBold: z.boolean().optional(),
  normalizePunctuation: z.boolean().optional(),
}).strict();

const stylesSchema = z.object({
  documentTitle: elementStyleSchema.optional(),
  h1: elementStyleSchema,
  h2: elementStyleSchema,
  h3: elementStyleSchema,
  body: elementStyleSchema,
  code: elementStyleSchema,
  quote: elementStyleSchema,
  table: elementStyleSchema.optional(),
  caption: elementStyleSchema.optional(),
}).strict();

export const documentConfigSchema = z.object({
  global: globalConfigSchema,
  styles: stylesSchema,
}).strict();

const pageMarginPatchSchema = pageMarginSchema.partial().strict();
const pageSizePatchSchema = pageSizeSchema.partial().strict();
const headerConfigPatchSchema = headerConfigSchema.partial().strict();
const footerConfigPatchSchema = footerConfigSchema.partial().strict();
const tableOfContentsPatchSchema = z.object({
  maxLevel: numberSchema.optional(),
  titleStyle: elementStyleSchema.partial().strict().optional(),
  levelStyles: z.record(
    z.string(),
    elementStyleSchema.partial().strict(),
  ).optional(),
}).strict();
const bodyStartPatchSchema = bodyStartConfigSchema.partial().strict();
const elementStylePatchSchema = elementStyleSchema.partial().strict();

const globalConfigPatchSchema = z.object({
  pageMargin: z.union([numberSchema, pageMarginPatchSchema]).optional(),
  pageSize: pageSizePatchSchema.optional(),
  baseFontCn: z.string().optional(),
  baseFontEn: z.string().optional(),
  horizontalRule: horizontalRuleSchema.optional(),
  includeTableOfContents: z.boolean().optional(),
  header: headerConfigPatchSchema.optional(),
  footer: footerConfigPatchSchema.optional(),
  tableOfContents: tableOfContentsPatchSchema.optional(),
  bodyStart: bodyStartPatchSchema.optional(),
  tableHeaderBold: z.boolean().optional(),
  normalizePunctuation: z.boolean().optional(),
}).strict();

const stylesPatchSchema = z.object({
  documentTitle: elementStylePatchSchema.optional(),
  h1: elementStylePatchSchema.optional(),
  h2: elementStylePatchSchema.optional(),
  h3: elementStylePatchSchema.optional(),
  body: elementStylePatchSchema.optional(),
  code: elementStylePatchSchema.optional(),
  quote: elementStylePatchSchema.optional(),
  table: elementStylePatchSchema.optional(),
  caption: elementStylePatchSchema.optional(),
}).strict();

function hasPatchValues(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (!isPlainObject(value)) return true;
  return Object.values(value).some(hasPatchValues);
}

export const documentConfigPatchSchema = z.object({
  global: globalConfigPatchSchema.optional(),
  styles: stylesPatchSchema.optional(),
}).strict().refine(
  (patch) => hasPatchValues(patch.global) || hasPatchValues(patch.styles),
  { message: 'Document config patch must contain at least one supported value' },
);

export type DocumentConfigPatch = z.infer<typeof documentConfigPatchSchema>;

const storedNumberSchema = z.preprocess(
  (value) => (
    typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : value
  ),
  numberSchema,
);

const storedBooleanSchema = z.preprocess(
  (value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  },
  z.boolean(),
);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function storedField<T>(
  schema: z.ZodType<T>,
  fallback: Exclude<T, undefined>,
) {
  return schema
    .catch(() => fallback)
    .default(() => fallback);
}

function storedOptionalField<T>(schema: z.ZodType<T>, fallback: T | undefined) {
  return fallback === undefined
    ? schema.optional().catch(undefined)
    : storedField(schema, fallback as Exclude<T, undefined>);
}

function createStoredElementStyleSchema(defaults: ElementStyle) {
  return z.preprocess(
    (value) => isPlainObject(value) ? value : {},
    z.object({
      fontFamily: storedOptionalField(z.string(), defaults.fontFamily),
      fontFamilyEn: storedOptionalField(z.string(), defaults.fontFamilyEn),
      fontSize: storedField(storedNumberSchema, defaults.fontSize),
      color: storedField(z.string(), defaults.color),
      bold: storedField(storedBooleanSchema, defaults.bold),
      italic: storedField(storedBooleanSchema, defaults.italic),
      lineSpacing: storedField(
        z.union([storedNumberSchema, z.string()]),
        defaults.lineSpacing,
      ),
      spaceBefore: storedField(storedNumberSchema, defaults.spaceBefore),
      spaceAfter: storedField(storedNumberSchema, defaults.spaceAfter),
      alignment: storedField(alignmentSchema, defaults.alignment),
      firstLineIndent: storedField(storedNumberSchema, defaults.firstLineIndent),
      backgroundColor: storedOptionalField(z.string(), defaults.backgroundColor),
    }),
  );
}

function createStoredPartialElementStyleSchema(defaults: Partial<ElementStyle>) {
  return z.preprocess(
    (value) => isPlainObject(value) ? value : {},
    z.object({
      fontFamily: storedOptionalField(z.string(), defaults.fontFamily),
      fontFamilyEn: storedOptionalField(z.string(), defaults.fontFamilyEn),
      fontSize: storedOptionalField(storedNumberSchema, defaults.fontSize),
      color: storedOptionalField(z.string(), defaults.color),
      bold: storedOptionalField(storedBooleanSchema, defaults.bold),
      italic: storedOptionalField(storedBooleanSchema, defaults.italic),
      lineSpacing: storedOptionalField(
        z.union([storedNumberSchema, z.string()]),
        defaults.lineSpacing,
      ),
      spaceBefore: storedOptionalField(storedNumberSchema, defaults.spaceBefore),
      spaceAfter: storedOptionalField(storedNumberSchema, defaults.spaceAfter),
      alignment: storedOptionalField(alignmentSchema, defaults.alignment),
      firstLineIndent: storedOptionalField(storedNumberSchema, defaults.firstLineIndent),
      backgroundColor: storedOptionalField(z.string(), defaults.backgroundColor),
    }),
  );
}

function createStoredPageMarginSchema(defaults: number | PageMargin) {
  const objectDefaults = typeof defaults === 'number'
    ? DEFAULT_CONFIG.global.pageMargin as PageMargin
    : defaults;
  const marginObjectSchema = z.preprocess(
    (value) => isPlainObject(value) ? value : {},
    z.object({
      top: storedField(storedNumberSchema, objectDefaults.top),
      bottom: storedField(storedNumberSchema, objectDefaults.bottom),
      left: storedField(storedNumberSchema, objectDefaults.left),
      right: storedField(storedNumberSchema, objectDefaults.right),
    }),
  );

  return storedField(
    z.union([storedNumberSchema, marginObjectSchema]),
    defaults,
  );
}

function createStoredPageSizeSchema(defaults: PageSize) {
  return z.preprocess(
    (value) => isPlainObject(value) ? value : {},
    z.object({
      width: storedField(storedNumberSchema, defaults.width),
      height: storedField(storedNumberSchema, defaults.height),
      unit: storedOptionalField(z.enum(['in', 'cm']), defaults.unit),
    }),
  );
}

function createStoredHeaderSchema(defaults: HeaderConfig) {
  return z.preprocess(
    (value) => isPlainObject(value) ? value : {},
    z.object({
      enabled: storedField(storedBooleanSchema, defaults.enabled),
      text: storedField(z.string(), defaults.text),
      distance: storedField(storedNumberSchema, defaults.distance),
      fontFamily: storedOptionalField(z.string(), defaults.fontFamily),
      fontFamilyEn: storedOptionalField(z.string(), defaults.fontFamilyEn),
      fontSize: storedField(storedNumberSchema, defaults.fontSize),
      bold: storedOptionalField(storedBooleanSchema, defaults.bold),
      alignment: storedField(headerFooterAlignmentSchema, defaults.alignment),
    }),
  );
}

function createStoredFooterSchema(defaults: FooterConfig) {
  return z.preprocess(
    (value) => isPlainObject(value) ? value : {},
    z.object({
      enabled: storedField(storedBooleanSchema, defaults.enabled),
      pageNumber: storedField(storedBooleanSchema, defaults.pageNumber),
      format: storedField(z.string(), defaults.format),
      distance: storedField(storedNumberSchema, defaults.distance),
      fontFamily: storedOptionalField(z.string(), defaults.fontFamily),
      fontFamilyEn: storedOptionalField(z.string(), defaults.fontFamilyEn),
      fontSize: storedField(storedNumberSchema, defaults.fontSize),
      bold: storedOptionalField(storedBooleanSchema, defaults.bold),
      alignment: storedField(headerFooterAlignmentSchema, defaults.alignment),
      startAtBody: storedOptionalField(storedBooleanSchema, defaults.startAtBody),
    }),
  );
}

function createStoredTableOfContentsSchema(defaults: TableOfContentsConfig) {
  const defaultLevelStyles = defaults.levelStyles ?? {};
  return z.preprocess(
    (value) => isPlainObject(value) ? value : {},
    z.object({
      maxLevel: storedOptionalField(storedNumberSchema, defaults.maxLevel),
      titleStyle: defaults.titleStyle
        ? createStoredPartialElementStyleSchema(defaults.titleStyle)
        : elementStyleSchema.partial().strict().optional().catch(undefined),
      levelStyles: z.preprocess(
        (value) => isPlainObject(value) ? value : defaultLevelStyles,
        z.record(
          z.string(),
          z.unknown(),
        ).transform((styles) => Object.fromEntries(
          Object.entries({ ...defaultLevelStyles, ...styles }).map(([level, style]) => [
            level,
            createStoredPartialElementStyleSchema(defaultLevelStyles[level] ?? {}).parse(style),
          ]),
        )),
      ),
    }),
  );
}

function createStoredBodyStartSchema(defaults: BodyStartConfig) {
  return z.preprocess(
    (value) => isPlainObject(value) ? value : {},
    z.object({
      firstHeadingAsTitle: storedOptionalField(
        storedBooleanSchema,
        defaults.firstHeadingAsTitle,
      ),
      restartPageNumberAfterToc: storedOptionalField(
        storedBooleanSchema,
        defaults.restartPageNumberAfterToc,
      ),
      pageNumberStart: storedOptionalField(
        storedNumberSchema,
        defaults.pageNumberStart,
      ),
    }),
  );
}

const defaultGlobal = DEFAULT_CONFIG.global;
const defaultStyles = DEFAULT_CONFIG.styles;

const storedDocumentConfigSchema = z.preprocess(
  (value) => isPlainObject(value) ? value : {},
  z.object({
    global: z.preprocess(
      (value) => isPlainObject(value) ? value : {},
      z.object({
        pageMargin: createStoredPageMarginSchema(defaultGlobal.pageMargin),
        pageSize: createStoredPageSizeSchema(defaultGlobal.pageSize!),
        baseFontCn: storedField(z.string(), defaultGlobal.baseFontCn),
        baseFontEn: storedField(z.string(), defaultGlobal.baseFontEn),
        horizontalRule: storedField(horizontalRuleSchema, defaultGlobal.horizontalRule),
        includeTableOfContents: storedField(
          storedBooleanSchema,
          defaultGlobal.includeTableOfContents,
        ),
        header: createStoredHeaderSchema(defaultGlobal.header!),
        footer: createStoredFooterSchema(defaultGlobal.footer!),
        tableOfContents: createStoredTableOfContentsSchema(defaultGlobal.tableOfContents!),
        bodyStart: createStoredBodyStartSchema(defaultGlobal.bodyStart!),
        tableHeaderBold: storedField(storedBooleanSchema, defaultGlobal.tableHeaderBold!),
        normalizePunctuation: storedField(
          storedBooleanSchema,
          defaultGlobal.normalizePunctuation!,
        ),
      }),
    ),
    styles: z.preprocess(
      (value) => isPlainObject(value) ? value : {},
      z.object({
        documentTitle: createStoredElementStyleSchema(defaultStyles.documentTitle!),
        h1: createStoredElementStyleSchema(defaultStyles.h1),
        h2: createStoredElementStyleSchema(defaultStyles.h2),
        h3: createStoredElementStyleSchema(defaultStyles.h3),
        body: createStoredElementStyleSchema(defaultStyles.body),
        code: createStoredElementStyleSchema(defaultStyles.code),
        quote: createStoredElementStyleSchema(defaultStyles.quote),
        table: createStoredElementStyleSchema(defaultStyles.table!),
        caption: createStoredElementStyleSchema(defaultStyles.caption!),
      }),
    ),
  }),
);

export function parseDocumentConfig(value: unknown): DocumentConfig {
  const normalized = storedDocumentConfigSchema.safeParse(value);
  if (!normalized.success) {
    return structuredClone(DEFAULT_CONFIG);
  }

  const validated = documentConfigSchema.safeParse(normalized.data);
  return validated.success
    ? validated.data as DocumentConfig
    : structuredClone(DEFAULT_CONFIG);
}
