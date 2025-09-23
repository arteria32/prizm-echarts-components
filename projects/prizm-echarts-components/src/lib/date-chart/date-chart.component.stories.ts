import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PrizmDateChartComponent } from './date-chart.component';

const meta: Meta<PrizmDateChartComponent> = {
  title: 'DateChart',
  decorators: [
    moduleMetadata({
      imports: [PrizmDateChartComponent],
    }),
  ],
};
export default meta;
type Story = StoryObj<PrizmDateChartComponent>;

export const Default: Story = {
render:()=>({
    template:'<prizm-date-chart/>'
})
};

