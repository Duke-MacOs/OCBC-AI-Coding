import { 
  ContractsListResponse, 
  ContractStatus, 
  ContractUploadResponse,
  AmortizationCalculateResponse,
  AmortizationScenario,
  AmortizationStatus,
  AmortizationEntry,
  UpdateContractRequest,
  UpdateContractResponse
} from './types';

/**
 * Mock 合同列表数据
 */
export const mockContractsList: ContractsListResponse = {
  contracts: [
    {
      contractId: 3,
      totalAmount: 8000.0,
      startDate: '2024-03-01',
      endDate: '2024-08-31',
      vendorName: '供应商C',
      attachmentName: 'contract_20240324_150230_x9y8z7w6.pdf',
      createdAt: '2024-03-24T15:02:30.123456+08:00',
      status: ContractStatus.ACTIVE,
    },
    {
      contractId: 2,
      totalAmount: 7500.0,
      startDate: '2024-02-01',
      endDate: '2024-07-31',
      vendorName: '供应商B',
      attachmentName: 'contract_20240224_143052_b2c3d4e5.pdf',
      createdAt: '2024-02-24T14:30:52.789012+08:00',
      status: ContractStatus.ACTIVE,
    },
    {
      contractId: 1,
      totalAmount: 6000.0,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      vendorName: '供应商A',
      attachmentName: 'contract_20240124_143052_a1b2c3d4.pdf',
      createdAt: '2024-01-24T14:30:52.123456+08:00',
      status: ContractStatus.ACTIVE,
    },
  ],
  totalCount: 3,
  message: '查询成功',
};

/**
 * 生成分页 Mock 数据
 * @param page 页码
 * @param size 每页大小
 */
export const getMockContractsListPaginated = (
  page: number = 0,
  size: number = 10
): ContractsListResponse => {
  const start = page * size;
  const end = start + size;
  const contracts = mockContractsList.contracts.slice(start, end);

  return {
    contracts,
    totalCount: mockContractsList.totalCount,
    message: '查询成功',
  };
};

/**
 * 生成合同上传 Mock 数据
 * @param fileName 文件名
 */
export const getMockContractUploadResponse = (fileName: string): ContractUploadResponse => {
  const timestamp = new Date().toISOString();
  const randomId = Math.floor(Math.random() * 10000) + 1;
  
  return {
    contractId: randomId,
    totalAmount: 6000.0 + Math.random() * 4000, // 随机金额 6000-10000
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    taxRate: 0.06,
    vendorName: `测试供应商_${fileName.split('.')[0]}`,
    attachmentName: fileName,
    createdAt: timestamp,
    message: '合同上传和解析成功',
  };
};

/**
 * 生成摊销计算 Mock 数据
 * @param contractId 合同ID
 */
export const getMockAmortizationCalculate = (contractId: number): AmortizationCalculateResponse => {
  // 从 mock 合同列表中查找对应合同
  const contract = mockContractsList.contracts.find(c => c.contractId === contractId);
  
  if (!contract) {
    // 如果没找到，返回默认数据
    return {
      totalAmount: 6000.0,
      startDate: '2024-01',
      endDate: '2024-06',
      scenario: AmortizationScenario.SCENARIO_1,
      generatedAt: new Date().toISOString(),
      entries: [
        { id: null, amortizationPeriod: '2024-01', accountingPeriod: '2024-01', amount: 1000.0, status: AmortizationStatus.PENDING },
        { id: null, amortizationPeriod: '2024-02', accountingPeriod: '2024-02', amount: 1000.0, status: AmortizationStatus.PENDING },
        { id: null, amortizationPeriod: '2024-03', accountingPeriod: '2024-03', amount: 1000.0, status: AmortizationStatus.PENDING },
        { id: null, amortizationPeriod: '2024-04', accountingPeriod: '2024-04', amount: 1000.0, status: AmortizationStatus.PENDING },
        { id: null, amortizationPeriod: '2024-05', accountingPeriod: '2024-05', amount: 1000.0, status: AmortizationStatus.PENDING },
        { id: null, amortizationPeriod: '2024-06', accountingPeriod: '2024-06', amount: 1000.0, status: AmortizationStatus.PENDING },
      ],
    };
  }

  // 根据合同信息生成摊销明细
  const startDate = new Date(contract.startDate);
  const endDate = new Date(contract.endDate);
  
  // 计算月份差
  const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth()) + 1;
  
  // 计算每月摊销金额
  const monthlyAmount = contract.totalAmount / monthDiff;
  
  // 生成摊销明细条目
  const entries: AmortizationEntry[] = [];
  for (let i = 0; i < monthDiff; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + i);
    const period = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    entries.push({
      id: null,
      amortizationPeriod: period,
      accountingPeriod: period,
      amount: parseFloat(monthlyAmount.toFixed(2)),
      status: AmortizationStatus.PENDING,
    });
  }

  return {
    totalAmount: contract.totalAmount,
    startDate: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
    endDate: `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`,
    scenario: AmortizationScenario.SCENARIO_1,
    generatedAt: new Date().toISOString(),
    entries,
  };
};

/**
 * 生成更新合同 Mock 数据
 * @param contractId 合同ID
 * @param request 更新请求参数
 */
export const getMockUpdateContractResponse = (
  contractId: number,
  request: UpdateContractRequest
): UpdateContractResponse => {
  // 从 mock 合同列表中查找对应合同
  const contract = mockContractsList.contracts.find(c => c.contractId === contractId);
  
  // 使用合同的原始附件名和创建时间，或使用默认值
  const attachmentName = contract?.attachmentName || `contract_${new Date().getTime()}.pdf`;
  const createdAt = contract?.createdAt || new Date().toISOString();
  
  return {
    contractId,
    totalAmount: request.totalAmount,
    startDate: request.startDate,
    endDate: request.endDate,
    taxRate: request.taxRate,
    vendorName: request.vendorName,
    attachmentName,
    createdAt,
    message: '合同信息更新成功',
  };
};
