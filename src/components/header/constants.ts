// Word 风格字号
export const FONT_SIZES: { label: string; value: number }[] = [
  { label: '初号', value: 42 },
  { label: '小初', value: 36 },
  { label: '一号', value: 26 },
  { label: '小一', value: 24 },
  { label: '二号', value: 22 },
  { label: '小二', value: 18 },
  { label: '三号', value: 16 },
  { label: '小三', value: 15 },
  { label: '四号', value: 14 },
  { label: '小四', value: 12 },
  { label: '五号', value: 10.5 },
  { label: '小五', value: 9 },
  { label: '六号', value: 7.5 },
  { label: '小六', value: 6.5 },
  { label: '七号', value: 5.5 },
  { label: '八号', value: 5 },
];

export const FONT_SIZES_PT = [5, 5.5, 6.5, 7.5, 8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
export const FONTS_CN = ['SimSun', 'Microsoft YaHei', 'SimHei', 'KaiTi'];
export const FONTS_EN = ['Times New Roman', 'Arial', 'Georgia', 'Courier New'];
export const FONT_LABELS: Record<string, string> = {
  'SimSun': '宋体',
  'Microsoft YaHei': '微软雅黑',
  'SimHei': '黑体',
  'KaiTi': '楷体',
  'Times New Roman': '新罗马体 (Times New Roman)',
  'Arial': 'Arial',
  'Georgia': 'Georgia',
  'Courier New': 'Courier New',
};
export const LINE_SPACINGS = [1, 1.15, 1.5, 2, 2.5, 3];

// Word 风格颜色面板
export const THEME_COLORS = [
  // 第一行 - 主题色
  ['#000000', '#1F497D', '#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646', '#FFFF00', '#00B050'],
  // 第二行 - 浅色 80%
  ['#808080', '#C6D9F1', '#DBE5F1', '#F2DCDB', '#EBF1DE', '#E6E0EC', '#DBEEF4', '#FDE9D9', '#FFFFCC', '#C6EFCE'],
  // 第三行 - 浅色 60%
  ['#A6A6A6', '#8DB4E3', '#B9CDE5', '#E6B9B8', '#D7E4BD', '#CCC1DA', '#B7DEE8', '#FCD5B5', '#FFFF99', '#92D050'],
  // 第四行 - 浅色 40%  
  ['#C0C0C0', '#558ED5', '#95B3D7', '#D99694', '#C3D69B', '#B3A2C7', '#93CDDD', '#FAC090', '#FFFF66', '#54C545'],
  // 第五行 - 深色 25%
  ['#D9D9D9', '#17375E', '#376092', '#953735', '#77933C', '#604A7B', '#31859C', '#E46C0A', '#CCCC00', '#008040'],
  // 第六行 - 深色 50%
  ['#F2F2F2', '#10253E', '#254061', '#632523', '#4F6228', '#403152', '#215968', '#984807', '#999900', '#006030'],
];

export const STANDARD_COLORS = [
  '#C00000', '#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#7030A0'
];

export const STYLES = {
  selectClass: "h-7 px-2 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors",
  btnClass: "h-7 px-2 flex items-center justify-center border border-transparent rounded hover:bg-gray-100 dark:hover:bg-dark-surface active:bg-gray-200 dark:active:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200",
  btnActiveClass: "bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-700",
  dividerClass: "w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1",
  groupClass: "flex items-center gap-1 h-full px-1 first:pl-0 last:pr-0 border-r border-gray-200 dark:border-gray-700 last:border-r-0",
  labelClass: "text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block",
  inputClass: "h-7 px-2 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors",
  menuItemClass: "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center space-x-2"
};
