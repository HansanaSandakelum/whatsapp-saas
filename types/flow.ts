export type FlowStatus = "draft" | "published" | "deprecated";

export type FlowCategory = 
  | "SIGN_UP"
  | "SIGN_IN"
  | "APPOINTMENT_BOOKING"
  | "SURVEY"
  | "LEAD_GENERATION"
  | "CONTACT_US"
  | "PRODUCT_BROWSER"
  | "OTHER";

export interface FlowScreen {
  id: string;
  title: string;
  terminal?: boolean;
  layout: {
    type: "SingleColumnLayout";
    children: FlowComponent[];
  };
}

export interface FlowComponent {
  type: "TextHeading" | "TextBody" | "TextInput" | "TextArea" | "CheckboxGroup" | "RadioButtons" | "Dropdown" | "DatePicker" | "Footer" | "Image";
  label?: string;
  text?: string;
  name?: string;
  required?: boolean;
  inputType?: "text" | "number" | "email" | "phone";
  dataSource?: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
  options?: Array<{
    id: string;
    title: string;
  }>;
  visible?: string;
  action?: {
    name: "navigate" | "data_exchange" | "complete";
    payload?: {
      screen?: string;
      data?: Record<string, string>;
    };
  };
}

export interface Flow {
  id: string;
  name: string;
  status: FlowStatus;
  categories: FlowCategory[];
  version: string;
  updatedAt: string;
  screenCount: number;
  description?: string;
  screens?: FlowScreen[];
  wabaId?: string;
}
