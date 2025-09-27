import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PrizmDateChartComponent } from './date-chart.component';
import { generateMockData } from './utils';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

const meta: Meta<PrizmDateChartComponent> = {
  title: 'DateChart',

  component: PrizmDateChartComponent,
  argTypes: {
    series: {
      control: { type: 'object' },
      description: 'Array of series',
      defaultValue: [],
    },
  },
  decorators: [
    moduleMetadata({
      providers: [provideAnimations()],
      imports: [CommonModule],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
      series: Array.isArray(args.series) ? args.series : [],
    },
  }),
};
export default meta;
type Story = StoryObj<PrizmDateChartComponent>;

export const Default: Story = {
  args: {
    series: generateMockData(5),
  },
};
