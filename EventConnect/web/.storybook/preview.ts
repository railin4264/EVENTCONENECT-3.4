import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'primary',
          value: '#0ea5e9',
        },
        {
          name: 'secondary',
          value: '#d946ef',
        },
        {
          name: 'accent',
          value: '#f97316',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '720px',
          },
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },
    layout: 'centered',
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: ['Introduction', 'Components', 'Pages', 'Templates', 'Examples'],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'es', title: 'Español' },
          { value: 'fr', title: 'Français' },
          { value: 'de', title: 'Deutsch' },
          { value: 'it', title: 'Italiano' },
          { value: 'pt', title: 'Português' },
          { value: 'ru', title: 'Русский' },
          { value: 'zh', title: '中文' },
          { value: 'ja', title: '日本語' },
          { value: 'ko', title: '한국어' },
        ],
      },
    },
    direction: {
      description: 'Text direction',
      defaultValue: 'ltr',
      toolbar: {
        icon: 'arrowrightalt',
        items: [
          { value: 'ltr', title: 'Left to Right' },
          { value: 'rtl', title: 'Right to Left' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme;
      const locale = context.globals.locale;
      const direction = context.globals.direction;
      
      return (
        <div
          className={`storybook-wrapper theme-${theme} locale-${locale} direction-${direction}`}
          dir={direction}
          lang={locale}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;