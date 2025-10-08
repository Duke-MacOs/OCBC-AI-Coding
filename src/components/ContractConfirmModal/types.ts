// 预付时间表数据项
export interface PrepaymentItem {
  id: string;
  prepaymentDate: string;
  accountingDate: string;
  amount: number;
}

// 合同信息
export interface ContractInfo {
  id: string;
  name: string;
}

// 组件 Props
export interface ContractConfirmModalProps {
  visible: boolean;
  contractInfo: ContractInfo;
  prepaymentData: PrepaymentItem[];
  onConfirm: (data: PrepaymentItem[]) => void;
  onCancel: () => void;
}

// 表格列配置类型
export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  editable?: boolean;
  required?: boolean;
  valueType?: 'date' | 'money' | 'text';
  width?: number;
}
