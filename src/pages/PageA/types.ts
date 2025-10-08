// 文件上传相关类型
export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  size?: number;
  type?: string;
}

// 合同数据类型
export interface ContractData {
  id: string;
  contractName: string;
  createTime: string;
  status: 'active' | 'inactive';
  fileUrl?: string;
  description?: string;
}

// 页面状态类型
export interface PageAState {
  uploadedFiles: UploadFile[];
  contractList: ContractData[];
  loading: boolean;
  error: string | null;
}

// PageA 组件 Props
export interface PageAProps {}

// 上传组件配置类型
export interface UploadConfig {
  name: string;
  multiple: boolean;
  action: string;
  accept?: string;
  maxCount?: number;
}
