import {
  Blocks,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  CircuitBoard,
  Code2,
  Cpu,
  Gauge,
  GraduationCap,
  Handshake,
  Layers3,
  MessageSquareMore,
  Newspaper,
  PackageOpen,
  Radio,
  Rocket,
  ScanLine,
  ShoppingBag,
  Sparkles,
  TerminalSquare,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  short: string;
};

export const navItems: NavItem[] = [
  { label: '博客', href: '/blog', icon: Newspaper, short: '工程记录与行业观察' },
  { label: 'Showcase', href: '/showcase', icon: CircuitBoard, short: '代表项目与验证证据' },
  { label: '产品项目', href: '/products', icon: ShoppingBag, short: 'IP 核、PCB 与 AI 硬件' },
  { label: '系统学习', href: '/learn', icon: GraduationCap, short: '从入门到工程交付' },
  { label: '工程工具', href: '/tools', icon: Wrench, short: '常用计算与效率工具' },
];

export type ContentCard = {
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  href?: string;
  icon?: LucideIcon;
  status?: string;
  price?: string;
  tags?: string[];
};

export type SectionContent = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  stats: Array<{ value: string; label: string }>;
  filters: string[];
  cards: ContentCard[];
};

export const sectionContent: Record<string, SectionContent> = {
  blog: {
    slug: 'blog',
    eyebrow: 'FIELD NOTES / 工程笔记',
    title: '把工程现场，写成可复用的经验',
    description:
      '记录从需求拆解、RTL 实现、板级调试到产品落地的完整过程，也持续分析国产 FPGA、边缘 AI 与半导体市场。',
    accent: '#b8f205',
    icon: Newspaper,
    stats: [
      { value: '28', label: '深度文章' },
      { value: '11', label: '完整项目复盘' },
      { value: '6', label: '行业专题' },
    ],
    filters: ['全部', '硬件作品', 'FPGA 实战', '市场分析', 'AI 硬件'],
    cards: [
      {
        eyebrow: 'FPGA × AI',
        title: '从 RTL 到端侧部署：一块 FPGA AI 加速板的完整诞生',
        description: '围绕架构取舍、DDR 带宽、量化策略与板级调试，复盘一次真实交付。',
        meta: '18 分钟阅读 · 2026.07.22',
        href: '/guide',
        icon: Cpu,
        tags: ['Xilinx', 'AI 加速'],
      },
      {
        eyebrow: '市场观察',
        title: '国产 FPGA 的机会，不只在“替代”',
        description: '从供应链、工具链与细分场景三个角度，判断安路等国产器件的真实窗口。',
        meta: '12 分钟阅读 · 2026.07.16',
        href: '/guide',
        icon: ScanLine,
        tags: ['安路', '国产化'],
      },
      {
        eyebrow: '调试手记',
        title: '一次跨时钟域偶发错误的定位过程',
        description: 'ILA 看不到的低概率故障，如何通过约束复核、统计采样与最小复现定位。',
        meta: '9 分钟阅读 · 2026.07.08',
        href: '/guide',
        icon: Radio,
        tags: ['CDC', 'Vivado'],
      },
      {
        eyebrow: '板级工程',
        title: '高速接口板第一次点亮前，我会检查什么',
        description: '电源时序、参考时钟、配置链路与信号完整性的上电检查清单。',
        meta: '清单 · 2026.06.29',
        href: '/guide',
        icon: CircuitBoard,
        tags: ['PCB', 'Bring-up'],
      },
      {
        eyebrow: '方法论',
        title: '如何让 FPGA 项目从“能跑”走向“可交付”',
        description: '需求基线、验证覆盖、版本管理、量产测试与文档资产的工程化闭环。',
        meta: '15 分钟阅读 · 2026.06.18',
        href: '/guide',
        icon: Blocks,
        tags: ['工程管理', '交付'],
      },
      {
        eyebrow: 'AI 产品',
        title: '小模型上板：哪些算子值得做硬件加速',
        description: '从算术强度和数据搬运成本出发，判断定制加速是否真的划算。',
        meta: '14 分钟阅读 · 2026.06.02',
        href: '/guide',
        icon: Sparkles,
        tags: ['NPU', '量化'],
      },
    ],
  },
  showcase: {
    slug: 'showcase',
    eyebrow: 'SELECTED WORK / 代表项目',
    title: '用工程证据，展示真正解决过的问题',
    description:
      '不只展示漂亮的最终结果，也呈现架构选择、验证方法、实测指标和可复现的工程过程。',
    accent: '#2563eb',
    icon: CircuitBoard,
    stats: [
      { value: '11', label: '完整项目复盘' },
      { value: '3', label: '量产与交付项目' },
      { value: '100%', label: '提供验证证据' },
    ],
    filters: ['全部项目', 'FPGA + AI', '高速采集', '国产 FPGA', 'PCB'],
    cards: [
      {
        eyebrow: 'FPGA × EDGE AI',
        title: '低延时视觉检测加速卡',
        description: '从图像采集、预处理到 INT8 推理的完整数据通路，端到端延时低于 12 ms。',
        meta: '4.8× 相对 ARM 提速',
        href: '/guide',
        icon: Cpu,
        tags: ['FPGA + AI', 'Xilinx'],
      },
      {
        eyebrow: 'HIGH-SPEED ACQUISITION',
        title: '八通道同步数据采集平台',
        description: '完成多 ADC 相位对齐、DDR 环形缓存与千兆网实时传输。',
        meta: '1.6 GB/s 持续采集带宽',
        href: '/guide',
        icon: Radio,
        tags: ['高速采集', 'PCB'],
      },
      {
        eyebrow: 'ANLOGIC VIDEO IP',
        title: '安路视频接口 IP 套件',
        description: '覆盖视频输入、时序检测、帧缓存与显示输出，提供可复现实验工程。',
        meta: '6 个可复用模块',
        href: '/guide',
        icon: Layers3,
        tags: ['国产 FPGA', '安路'],
      },
      {
        eyebrow: 'BOARD BRING-UP',
        title: '高速接口核心板上电与调试',
        description: '从电源时序、参考时钟到信号完整性验证，建立完整板级证据链。',
        meta: '6 层 PCB · 12 项验收',
        href: '/guide',
        icon: CircuitBoard,
        tags: ['PCB', '板级调试'],
      },
    ],
  },
  products: {
    slug: 'products',
    eyebrow: 'LAB STORE / 实验室产品',
    title: '可以买走的工程能力',
    description:
      '经过项目验证的 IP、PCB 与 AI 硬件方案。每个产品都提供清晰规格、交付边界和集成支持。',
    accent: '#ff6b3d',
    icon: ShoppingBag,
    stats: [
      { value: '12', label: '可交付模块' },
      { value: '4', label: '量产硬件' },
      { value: '48h', label: '技术响应' },
    ],
    filters: ['全部产品', 'IP 核', 'PCB', 'AI 硬件', '方案设计'],
    cards: [
      {
        eyebrow: 'VIDEO IP',
        title: '多通道视频时序与帧同步 IP',
        description: '支持 AXI4-Stream、可配置缓存与跨时钟域，适合采集、拼接和显示链路。',
        meta: 'Verilog · 文档 · Testbench',
        status: '现货交付',
        price: '¥ 2,980 起',
        icon: Layers3,
        tags: ['Xilinx', '安路'],
      },
      {
        eyebrow: 'INTERFACE IP',
        title: '高速 LVDS 数据采集 IP',
        description: '字对齐、通道训练、错误统计与在线重同步，含板级联调指南。',
        meta: '最高 1.25 Gbps / lane',
        status: '现货交付',
        price: '¥ 3,680 起',
        icon: Radio,
        tags: ['LVDS', '采集'],
      },
      {
        eyebrow: 'FPGA PCB',
        title: '轻量级 FPGA 核心板',
        description: '面向控制与边缘计算，开放原理图、底板参考设计与 BSP。',
        meta: '6 层板 · 双路 DDR3 · 千兆网',
        status: '小批量',
        price: '¥ 699',
        icon: CircuitBoard,
        tags: ['核心板', '国产化'],
      },
      {
        eyebrow: 'EDGE AI',
        title: '边缘视觉 AI 加速模块',
        description: '摄像头接入、前处理、轻量模型推理和结果输出的一体化硬件。',
        meta: 'INT8 · MIPI/HDMI · Linux',
        status: '预约测试',
        price: '¥ 1,899',
        icon: Cpu,
        tags: ['AI', '视觉'],
      },
      {
        eyebrow: 'DESIGN SERVICE',
        title: 'FPGA + PCB 一体化方案设计',
        description: '从需求澄清、器件选型、逻辑设计到样机调通，按里程碑交付。',
        meta: '适合仪器、工业视觉与专用计算',
        status: '档期咨询',
        price: '项目制',
        icon: Boxes,
        tags: ['定制', '交付'],
      },
      {
        eyebrow: 'AI PRODUCT',
        title: '离线设备智能诊断终端',
        description: '融合振动与声音特征，在端侧完成异常识别和维护建议生成。',
        meta: '无需公网 · 本地数据闭环',
        status: '联合共创',
        price: '联系合作',
        icon: Gauge,
        tags: ['AI 产品', '工业'],
      },
    ],
  },
  community: {
    slug: 'community',
    eyebrow: 'FPGA CIRCLE / 技术交流',
    title: '和认真做工程的人，讨论具体问题',
    description:
      '围绕 Xilinx 与安路器件建立高信噪比技术圈：问题带上下文，答案给验证依据，成果可沉淀。',
    accent: '#3dc7ff',
    icon: Users,
    stats: [
      { value: '386', label: '同行工程师' },
      { value: '1,240', label: '已解决问题' },
      { value: '92%', label: '有效回复率' },
    ],
    filters: ['最新讨论', 'Xilinx', '安路', '板级调试', '职业成长'],
    cards: [
      {
        eyebrow: 'XILINX · VIVADO',
        title: 'UltraScale+ DDR4 MIG 校准偶发失败，如何缩小排查范围？',
        description: '已提供时钟树、约束片段、温度条件与失败寄存器快照。',
        meta: '12 个回复 · 20 分钟前',
        status: '讨论中',
        icon: MessageSquareMore,
        tags: ['DDR4', 'MIG'],
      },
      {
        eyebrow: 'ANLOGIC · TD',
        title: 'EG4S20 的 LVDS 输入延迟校准实践',
        description: '分享不同 PVT 条件下的窗口扫描结果和可复用训练状态机。',
        meta: '8 个回复 · 1 小时前',
        status: '已解决',
        icon: Radio,
        tags: ['安路', 'LVDS'],
      },
      {
        eyebrow: 'CAREER',
        title: '做了三年 FPGA，怎样建立可被看见的作品集？',
        description: '从开源边界、技术文章结构和项目演示三个角度给出建议。',
        meta: '21 个回复 · 昨天',
        status: '精华',
        icon: BriefcaseBusiness,
        tags: ['职业', '影响力'],
      },
      {
        eyebrow: 'BOARD DEBUG',
        title: 'GTY 误码率在高温下上升的定位记录',
        description: '对比参考时钟、均衡参数、电源噪声和连接器损耗。',
        meta: '6 个回复 · 2 天前',
        status: '已解决',
        icon: ScanLine,
        tags: ['GTY', 'SI'],
      },
    ],
  },
  learn: {
    slug: 'learn',
    eyebrow: 'LEARNING SYSTEM / 系统学习',
    title: '建立一套能交付项目的 FPGA 知识体系',
    description:
      '不堆砌零散语法。课程按工程任务组织：先建立模型，再完成设计，最后通过可测量的项目验收。',
    accent: '#a88bff',
    icon: GraduationCap,
    stats: [
      { value: '5', label: '学习阶段' },
      { value: '42', label: '核心课时' },
      { value: '9', label: '项目验收' },
    ],
    filters: ['学习路线', '数字基础', 'RTL 设计', '接口系统', '工程交付'],
    cards: [
      {
        eyebrow: 'STAGE 01 · 2 周',
        title: '数字系统与 Verilog 心智模型',
        description: '组合/时序逻辑、仿真语义、阻塞与非阻塞、可综合设计边界。',
        meta: '8 课时 · 2 个验收实验',
        status: '免费',
        href: '/guide',
        icon: Code2,
        tags: ['Verilog', '仿真'],
      },
      {
        eyebrow: 'STAGE 02 · 3 周',
        title: '同步设计、复位与跨时钟域',
        description: '从亚稳态模型到 CDC 结构、约束和验证，建立可靠性意识。',
        meta: '10 课时 · 2 个验收实验',
        status: '核心',
        href: '/guide',
        icon: ScanLine,
        tags: ['CDC', '时序'],
      },
      {
        eyebrow: 'STAGE 03 · 4 周',
        title: 'AXI 与存储子系统',
        description: '掌握 AXI4/Stream、FIFO、DDR 带宽估算与背压处理。',
        meta: '9 课时 · 2 个项目',
        status: '核心',
        href: '/guide',
        icon: Layers3,
        tags: ['AXI', 'DDR'],
      },
      {
        eyebrow: 'STAGE 04 · 4 周',
        title: '高速接口与板级调试',
        description: '时钟、约束、ILA、LVDS/SerDes 与从不上电到稳定运行。',
        meta: '8 课时 · 2 个项目',
        status: '进阶',
        href: '/guide',
        icon: CircuitBoard,
        tags: ['Vivado', '调试'],
      },
      {
        eyebrow: 'STAGE 05 · 3 周',
        title: '工程化交付与个人作品',
        description: '规范、验证、版本、文档和演示，把最后一个项目做成公开作品。',
        meta: '7 课时 · 毕业项目',
        status: '实战',
        href: '/guide',
        icon: Rocket,
        tags: ['交付', '作品集'],
      },
    ],
  },
  partners: {
    slug: 'partners',
    eyebrow: 'CO-CREATION / 工程师共创',
    title: '一个人有判断，一群人能把它做成产品',
    description:
      '连接 FPGA、嵌入式、PCB、算法与产品伙伴，以透明里程碑推进联合研发、内容共创和商业落地。',
    accent: '#ffce54',
    icon: Handshake,
    stats: [
      { value: '17', label: '共创伙伴' },
      { value: '8', label: '跨领域项目' },
      { value: '3', label: '产品已落地' },
    ],
    filters: ['合作方式', '联合研发', '内容共创', '渠道伙伴', '招募中'],
    cards: [
      {
        eyebrow: '联合研发',
        title: '用互补能力完成复杂硬件',
        description: '适合需要 FPGA + 嵌入式 + 算法 + 结构协作的硬件产品。',
        meta: '按里程碑定义投入与收益',
        status: '长期开放',
        icon: Boxes,
        tags: ['研发', '产品化'],
      },
      {
        eyebrow: 'IP 联营',
        title: '把项目模块沉淀成可销售 IP',
        description: '共同完善验证、文档、授权和支持体系，建立持续性收入。',
        meta: '技术贡献与商业收益透明',
        status: '招募 3 人',
        icon: PackageOpen,
        tags: ['IP', '商业化'],
      },
      {
        eyebrow: '内容共创',
        title: '联合发布高质量工程专题',
        description: '共同完成系列文章、直播拆解或项目课程，让专业能力被行业看见。',
        meta: '季度主题制',
        status: '下期筹备',
        icon: BookOpen,
        tags: ['文章', '直播'],
      },
      {
        eyebrow: '方案伙伴',
        title: '面向客户提供联合方案',
        description: '把成熟 IP、硬件平台和行业渠道组合为更完整的交付能力。',
        meta: '需求评审后进入伙伴库',
        status: '开放申请',
        icon: BriefcaseBusiness,
        tags: ['渠道', '交付'],
      },
    ],
  },
  tools: {
    slug: 'tools',
    eyebrow: 'ENGINEER TOOLBOX / 工程工具',
    title: '把重复计算交给工具，把注意力留给设计',
    description:
      '面向 FPGA 日常工作的小工具集合。可直接在浏览器中使用，不上传数据，并附带公式与工程提示。',
    accent: '#5ee0aa',
    icon: Wrench,
    stats: [
      { value: '8', label: '在线工具' },
      { value: '0', label: '数据上传' },
      { value: '100%', label: '浏览器计算' },
    ],
    filters: ['在线计算', '时钟与时序', '带宽', '数制转换', '约束模板'],
    cards: [],
  },
};

export const featuredProjects = [
  {
    index: '01',
    type: '边缘 AI · FPGA',
    title: '低延时视觉检测加速卡',
    description: '从图像采集、预处理到 INT8 推理的完整数据通路，端到端延时低于 12 ms。',
    metric: '4.8×',
    metricLabel: '相对 ARM 提速',
  },
  {
    index: '02',
    type: '高速采集 · PCB',
    title: '八通道同步数据采集平台',
    description: '多 ADC 相位对齐、DDR 环形缓存与千兆网实时传输，适合仪器与状态监测。',
    metric: '1.6 GB/s',
    metricLabel: '持续采集带宽',
  },
  {
    index: '03',
    type: '国产 FPGA · IP',
    title: '安路视频接口 IP 套件',
    description: '覆盖视频输入、时序检测、帧缓存与显示输出，提供可复现实验工程。',
    metric: '6',
    metricLabel: '可复用模块',
  },
];

export const searchIndex = [
  { title: '首页', description: '时工的半导体实验室', href: '/', group: '导航' },
  ...navItems.map((item) => ({
    title: item.label,
    description: item.short,
    href: item.href,
    group: '栏目',
  })),
  ...Object.values(sectionContent)
    .filter((section) => !['community', 'partners'].includes(section.slug))
    .flatMap((section) =>
    section.cards.map((card) => ({
      title: card.title,
      description: `${card.eyebrow} · ${card.description}`,
      href: card.href ?? `/${section.slug}`,
      group: section.title,
    })),
  ),
  {
    title: 'FPGA 工程交付指南',
    description: '时序约束、CDC、验证、版本与文档',
    href: '/guide',
    group: '系统学习',
  },
];
