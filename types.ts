
export enum UiState {
  IDLE = 'idle',
  LOADING = 'loading',
  SHOW = 'show',
}

export enum Mode {
  CREATE = 'create',
  EDIT = 'edit',
}

export interface ImageFile {
  file: File;
  preview: string;
}
