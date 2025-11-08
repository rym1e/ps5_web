import { defineConfig, presetAttributify, presetUno } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  theme: {
    colors: {
      brand: {
        primary: '#2F88FF',
        success: '#0BA360',
        warning: '#FF9F1C',
        danger: '#FF4D4F',
        info: '#4C6EF5'
      }
    }
  }
});
