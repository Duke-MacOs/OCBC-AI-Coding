import { apiGet, apiPost } from '../client';
import { 
  ContractsListResponse, 
  PaginationParams, 
  ContractUploadResponse,
  AmortizationCalculateResponse
} from './types';
import { 
  mockContractsList, 
  getMockContractsListPaginated, 
  getMockContractUploadResponse,
  getMockAmortizationCalculate
} from './mock';

// 是否使用 Mock 数据（可通过环境变量控制）
const USE_MOCK = (import.meta as any).env?.VITE_USE_MOCK === 'true' || true;

// Mock API URLs (待替换为真实地址)
const MOCK_API_BASE = '/mock-api';

/**
 * 查询所有合同列表
 * @returns 合同列表响应
 */
export const getAllContracts = async (): Promise<ContractsListResponse> => {
  if (USE_MOCK) {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve(mockContractsList);
  }

  // 真实 API 调用 (待替换为真实 URL)
  const response = await apiGet<ContractsListResponse>(`${MOCK_API_BASE}/contracts`);
  return response as unknown as ContractsListResponse;
};

/**
 * 分页查询合同列表
 * @param params 分页参数
 * @returns 合同列表响应
 */
export const getContractsList = async (
  params?: PaginationParams
): Promise<ContractsListResponse> => {
  const { page = 0, size = 10 } = params || {};

  if (USE_MOCK) {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve(getMockContractsListPaginated(page, size));
  }

  // 真实 API 调用 (待替换为真实 URL)
  const response = await apiGet<ContractsListResponse>(
    `${MOCK_API_BASE}/contracts/list`,
    { page, size }
  );
  return response as unknown as ContractsListResponse;
};

/**
 * 上传合同文件
 * @param file 合同文件
 * @returns 合同上传响应
 */
export const uploadContract = async (file: File): Promise<ContractUploadResponse> => {
  if (USE_MOCK) {
    // 模拟网络延迟（上传较慢）
    await new Promise((resolve) => setTimeout(resolve, 800));
    return Promise.resolve(getMockContractUploadResponse(file.name));
  }

  // 真实 API 调用 (待替换为真实 URL)
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiPost<ContractUploadResponse>(
    `${MOCK_API_BASE}/contracts/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response as unknown as ContractUploadResponse;
};

/**
 * 计算合同摊销明细
 * @param contractId 合同ID
 * @returns 摊销计算响应
 */
export const calculateAmortization = async (
  contractId: number
): Promise<AmortizationCalculateResponse> => {
  if (USE_MOCK) {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 400));
    return Promise.resolve(getMockAmortizationCalculate(contractId));
  }

  // 真实 API 调用 (待替换为真实 URL)
  const response = await apiGet<AmortizationCalculateResponse>(
    `${MOCK_API_BASE}/amortization/calculate/${contractId}`
  );
  return response as unknown as AmortizationCalculateResponse;
};

// 导出类型
export * from './types';
