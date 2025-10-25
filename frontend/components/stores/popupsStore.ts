import { create } from 'zustand';

interface PopupsStore {
  setTimePopup(popup: Partial<PopupProps>): void;
  timePopup: PopupProps;
}

interface PopupProps {
  appId: string;
  open: boolean;
}

export const usePopupsStore = create<PopupsStore>(set =>
  ({
    timePopup: {
      appId: '',
      open: false,
    },
    setTimePopup: (popup: Partial<PopupProps>): void => {
      set(state => ({
        timePopup: {
          ...state.timePopup,
          ...popup,
        },
      }));
    },
  }));
