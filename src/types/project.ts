export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  progress: number
  startDate: string
  endDate: string
  teamSize: number
  budget: number
  manager: string
  category?: string
  location?: string

  //  Các trường mở rộng cho quản lý pháp lý đầu tư
  investmentLevel?: string                  // Cấp quyết định chủ trương đầu tư (e.g. "Trung ương", "Tỉnh", "Huyện")
  investmentApproval?: string               // Cấp phê duyệt quyết định đầu tư
  projectGroup?: string                     // Nhóm dự án (A, B, C,...)
  investor?: string                         // Chủ đầu tư
  capitalSource?: string                    // Nguồn vốn
  investmentType?: string                   // Hình thức đầu tư (BT, BOT, PPP, ngân sách,...)
  managementType?: string                   // Loại hình quản lý dự án
  biddingMethod?: string                    // Gói thầu chính (nếu có)
  projectScale?: string                     // Quy mô dự án (Số căn, diện tích, quy mô tài chính...)
  designStepCount?: number                  // Số bước thiết kế (1 bước, 2 bước...)
  designCapacity?: string                   // Năng lực thiết kế (có thể chọn tên đơn vị/tổ chức)
  approvalDate?: string                     // Ngày lập quyết toán
  legalDocuments?: string[]                 // Danh sách tài liệu pháp lý đính kèm URL

  //  Các trường mở rộng cho thông tin xây dựng
  constructionLevel?: string                // Cấp công trình (1, 2, 3,...)
  constructionType?: string                 // Loại công trình (nhà ở, công nghiệp,...)
  executionTime?: string                    // Thời gian thực hiện dự kiến
  constructionLocation?: string             // Địa điểm xây dựng
  simplifiedLocation?: string               // Địa điểm rút gọn
  designStandards?: string                  // Tiêu chuẩn áp dụng (TCVN, QCVN...)

  //  Quản lý hồ sơ và mục tiêu
  goals?: string                            // Mục tiêu dự án
  method?: string                           // Phương pháp tổng hợp / tiếp cận / thực hiện
  notes?: string                            // Ghi chú khác

  //  Trường sẵn có
  phases?: ProjectPhase[]
  tasks?: ProjectTask[]
  createdAt?: string
  updatedAt?: string
}

export interface ProjectPhase {
  id: string
  name: string
  description: string
  order: number
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  startDate?: string
  endDate?: string
  documentProjectPhase?: ProjectPhaseDocument[]
  tasks: ProjectTask[]
  legalBasis?: string
}


export interface ProjectTask {
  id: string
  name: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  startDate?: string
  endDate?: string
  progress: number
  dependencies?: string[]
  documentsTask?: TaskDocument[]
  legalBasis?: string
}

export interface BaseDocument {
  id: string
  name: string
  url?: string
  uploadedAt: string
  uploadedBy: string
}

export interface TaskDocument extends BaseDocument {
  type: 'report' | 'approval' | 'design' | 'contract' | 'certificate' | 'other'
}

export interface ProjectPhaseDocument extends BaseDocument {
  type: 'plan' | 'report' | 'contract' | 'approval' | 'legal' | 'other'
  description?: string
}


export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  phases: Omit<ProjectPhase, 'id'>[]
}
