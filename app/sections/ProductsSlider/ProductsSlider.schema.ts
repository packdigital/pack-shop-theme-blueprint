import {BUTTONS} from '~/settings/common';
import {containerSettings} from '~/settings/container';

export function Schema() {
  return {
    category: 'Product',
    label: 'Products Slider',
    key: 'products-slider',
    previewSrc:
      'https://cdn.shopify.com/s/files/1/0629/5519/2520/files/products-slider-preview.jpg?v=1710957354',
    fields: [
      {
        label: 'Heading',
        name: 'heading',
        component: 'text',
        defaultValue: 'Products Slider Heading',
      },
      {
        label: 'Products',
        name: 'products',
        component: 'group-list',
        description:
          'Products must be both active and on the Hydrogen sales channel to display',
        itemProps: {
          label: '{{item.product.handle}}',
        },
        fields: [
          {
            name: 'product',
            component: 'productSearch',
            label: 'Product',
          },
        ],
        defaultValue: [{handle: ''}, {handle: ''}, {handle: ''}, {handle: ''}],
      },
      {
        label: 'Footer Button',
        name: 'button',
        component: 'link',
        description: `To link to a product modal, write out an external url in this format: '?product=<product-handle>', e.g. '?product=basic-tee'. The product must be both active and on the Hydrogen sales channel'`,
      },
      {
        label: 'Product Item Settings',
        name: 'productItem',
        component: 'group',
        description: 'Star rating',
        fields: [
          {
            label: 'Enable Star Rating',
            name: 'enabledStarRating',
            component: 'toggle',
            description:
              'For the actual star rating, API logic must be first implemented in the ProductStars component. Otherwise the manual rating set in site settings will be displayed',
            toggleLabels: {
              true: 'On',
              false: 'Off',
            },
          },
        ],
        defaultValue: {
          enabledStarRating: false,
        },
      },
      {
        label: 'Slider Settings',
        name: 'slider',
        component: 'group',
        description: 'Slider style, slides per view',
        fields: [
          {
            label: 'Slider Style',
            name: 'sliderStyle',
            component: 'select',
            description:
              'Loop and centered settings only apply if the number of products is at least twice the number of slides per view',
            options: [
              {label: 'Contained', value: 'contained'},
              {label: 'Contained w/ Loop', value: 'containedWithLoop'},
              {label: 'Full Bleed, Centered w/ Loop', value: 'fullBleed'},
              {
                label: 'Full Bleed, Centered w/ Loop & Gradient',
                value: 'fullBleedWithGradient',
              },
            ],
          },
          {
            label: 'Slides Per View (desktop)',
            name: 'slidesPerViewDesktop',
            description: 'Save and refresh page to observe change',
            component: 'number',
          },
          {
            label: 'Slides Per View (tablet)',
            name: 'slidesPerViewTablet',
            component: 'number',
            description:
              'Save and refresh page to observe change\nTip: use decimals to show partial slides',
          },
          {
            label: 'Slides Per View (mobile)',
            name: 'slidesPerViewMobile',
            component: 'number',
            description:
              'Save and refresh page to observe change\nTip: use decimals to show partial slides',
          },
        ],
        defaultValue: {
          sliderStyle: 'contained',
          slidesPerViewDesktop: 4,
          slidesPerViewTablet: 3.4,
          slidesPerViewMobile: 1.4,
        },
      },
      {
        label: 'Section Settings',
        name: 'section',
        component: 'group',
        description: 'Button style, full width',
        fields: [
          {
            label: 'Button Style',
            name: 'buttonStyle',
            component: 'select',
            options: BUTTONS,
          },
          {
            label: 'Full Width',
            name: 'fullWidth',
            component: 'toggle',
            description: 'Removes max width from contained styles',
            toggleLabels: {
              true: 'On',
              false: 'Off',
            },
          },
        ],
        defaultValue: {
          buttonStyle: 'theme-btn-primary',
          fullWidth: false,
        },
      },
      containerSettings(),
    ],
  };
}
