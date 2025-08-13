export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabChangeEvent {
  activeTab: string;
  previousTab?: string;
}
