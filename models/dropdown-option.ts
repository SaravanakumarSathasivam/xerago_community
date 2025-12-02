import { IDocument } from './user';

export interface IDropdownOption extends IDocument {
  category: string;
  value: string;
  label: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  metadata?: {
    color?: string;
    icon?: string;
    parentCategory?: string;
  };
}
