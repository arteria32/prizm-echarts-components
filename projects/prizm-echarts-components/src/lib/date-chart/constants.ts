export const ECHARTS_CONFIG_PRESETS = {
  DATA_ZOOM: [
    {
      type: 'slider',
    },
    {
      type: 'inside',
    },
  ],

  X_AXIS: [
    {
      type: 'time' as const,
    },
  ],
  Y_AXIS: [
    {
      type: 'value' as const,
    },
  ],
};

export const ICONS_PATHS = {
  EXPORT_FILE: 'M12 16l-5-5h3V5h4v6h3l-5 5z',
  IMPORT_FILE: 'M12 8 L17 13 L14 13 L14 19 L10 19 L10 13 L7 13 L12 8 Z',
};
