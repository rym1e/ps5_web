import { reactive } from 'vue';

const state = reactive({
  message: '',
  type: 'info',
  visible: false
});

let timer;

const show = (type, message) => {
  state.message = message;
  state.type = type;
  state.visible = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    state.visible = false;
  }, 2000);
};

export const useToast = () => ({
  state,
  success: (msg) => show('success', msg),
  warning: (msg) => show('warning', msg),
  error: (msg) => show('error', msg)
});
