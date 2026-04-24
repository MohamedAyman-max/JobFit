import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AcademicNote } from "@/components/shared/AcademicNote";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Stethoscope,
  Landmark,
  Factory,
  ShoppingBag,
  Cpu,
  Users,
  Briefcase,
  DollarSign,
} from "lucide-react";

const sectorData = {
  tech: {
    name: "Technology",
    icon: Cpu,
    color: "hsl(var(--primary))",
    trend: "growing",
    growth: "+12.5%",
    totalJobs: "2.4M",
    avgSalary: "$125,000",
    demandTrend: [
      { month: "Jan", demand: 85, hiring: 78 },
      { month: "Feb", demand: 88, hiring: 82 },
      { month: "Mar", demand: 92, hiring: 85 },
      { month: "Apr", demand: 95, hiring: 88 },
      { month: "May", demand: 98, hiring: 92 },
      { month: "Jun", demand: 105, hiring: 98 },
      { month: "Jul", demand: 110, hiring: 102 },
      { month: "Aug", demand: 115, hiring: 108 },
      { month: "Sep", demand: 120, hiring: 112 },
      { month: "Oct", demand: 125, hiring: 118 },
      { month: "Nov", demand: 130, hiring: 122 },
      { month: "Dec", demand: 135, hiring: 128 },
    ],
    topRoles: [
      { role: "Software Engineer", openings: 45000, growth: 15 },
      { role: "Data Scientist", openings: 32000, growth: 22 },
      { role: "Cloud Architect", openings: 28000, growth: 28 },
      { role: "ML Engineer", openings: 25000, growth: 35 },
      { role: "DevOps Engineer", openings: 22000, growth: 18 },
    ],
    skillDemand: [
      { skill: "Python", demand: 92 },
      { skill: "Cloud (AWS/Azure)", demand: 88 },
      { skill: "JavaScript", demand: 85 },
      { skill: "AI/ML", demand: 78 },
      { skill: "Kubernetes", demand: 72 },
    ],
  },
  healthcare: {
    name: "Healthcare",
    icon: Stethoscope,
    color: "hsl(142, 76%, 36%)",
    trend: "growing",
    growth: "+8.2%",
    totalJobs: "1.8M",
    avgSalary: "$95,000",
    demandTrend: [
      { month: "Jan", demand: 72, hiring: 68 },
      { month: "Feb", demand: 74, hiring: 70 },
      { month: "Mar", demand: 76, hiring: 72 },
      { month: "Apr", demand: 78, hiring: 74 },
      { month: "May", demand: 80, hiring: 76 },
      { month: "Jun", demand: 82, hiring: 78 },
      { month: "Jul", demand: 85, hiring: 80 },
      { month: "Aug", demand: 88, hiring: 83 },
      { month: "Sep", demand: 90, hiring: 85 },
      { month: "Oct", demand: 92, hiring: 87 },
      { month: "Nov", demand: 95, hiring: 90 },
      { month: "Dec", demand: 98, hiring: 92 },
    ],
    topRoles: [
      { role: "Registered Nurse", openings: 85000, growth: 12 },
      { role: "Medical Technologist", openings: 42000, growth: 8 },
      { role: "Health Informatics", openings: 35000, growth: 18 },
      { role: "Physical Therapist", openings: 28000, growth: 10 },
      { role: "Physician Assistant", openings: 22000, growth: 15 },
    ],
    skillDemand: [
      { skill: "Patient Care", demand: 95 },
      { skill: "EHR Systems", demand: 82 },
      { skill: "Medical Coding", demand: 78 },
      { skill: "Telehealth", demand: 72 },
      { skill: "Data Analysis", demand: 65 },
    ],
  },
  finance: {
    name: "Finance",
    icon: Landmark,
    color: "hsl(45, 93%, 47%)",
    trend: "stable",
    growth: "+4.8%",
    totalJobs: "1.2M",
    avgSalary: "$115,000",
    demandTrend: [
      { month: "Jan", demand: 65, hiring: 62 },
      { month: "Feb", demand: 66, hiring: 63 },
      { month: "Mar", demand: 68, hiring: 65 },
      { month: "Apr", demand: 67, hiring: 64 },
      { month: "May", demand: 69, hiring: 66 },
      { month: "Jun", demand: 70, hiring: 67 },
      { month: "Jul", demand: 71, hiring: 68 },
      { month: "Aug", demand: 72, hiring: 69 },
      { month: "Sep", demand: 73, hiring: 70 },
      { month: "Oct", demand: 74, hiring: 71 },
      { month: "Nov", demand: 75, hiring: 72 },
      { month: "Dec", demand: 76, hiring: 73 },
    ],
    topRoles: [
      { role: "Financial Analyst", openings: 38000, growth: 6 },
      { role: "Risk Manager", openings: 25000, growth: 8 },
      { role: "Quantitative Analyst", openings: 18000, growth: 12 },
      { role: "Compliance Officer", openings: 22000, growth: 5 },
      { role: "Fintech Developer", openings: 15000, growth: 25 },
    ],
    skillDemand: [
      { skill: "Financial Modeling", demand: 88 },
      { skill: "Risk Analysis", demand: 82 },
      { skill: "Python/R", demand: 75 },
      { skill: "Blockchain", demand: 62 },
      { skill: "Regulatory Compliance", demand: 78 },
    ],
  },
  manufacturing: {
    name: "Manufacturing",
    icon: Factory,
    color: "hsl(280, 65%, 60%)",
    trend: "stable",
    growth: "+3.2%",
    totalJobs: "950K",
    avgSalary: "$72,000",
    demandTrend: [
      { month: "Jan", demand: 55, hiring: 52 },
      { month: "Feb", demand: 56, hiring: 53 },
      { month: "Mar", demand: 57, hiring: 54 },
      { month: "Apr", demand: 58, hiring: 55 },
      { month: "May", demand: 58, hiring: 55 },
      { month: "Jun", demand: 59, hiring: 56 },
      { month: "Jul", demand: 60, hiring: 57 },
      { month: "Aug", demand: 61, hiring: 58 },
      { month: "Sep", demand: 62, hiring: 59 },
      { month: "Oct", demand: 62, hiring: 59 },
      { month: "Nov", demand: 63, hiring: 60 },
      { month: "Dec", demand: 64, hiring: 61 },
    ],
    topRoles: [
      { role: "Industrial Engineer", openings: 28000, growth: 5 },
      { role: "Quality Manager", openings: 22000, growth: 4 },
      { role: "Automation Engineer", openings: 18000, growth: 15 },
      { role: "Supply Chain Manager", openings: 25000, growth: 8 },
      { role: "Robotics Technician", openings: 12000, growth: 20 },
    ],
    skillDemand: [
      { skill: "Lean Manufacturing", demand: 85 },
      { skill: "CAD/CAM", demand: 80 },
      { skill: "Automation/PLC", demand: 75 },
      { skill: "Quality Control", demand: 82 },
      { skill: "IoT/Industry 4.0", demand: 68 },
    ],
  },
  retail: {
    name: "Retail & E-commerce",
    icon: ShoppingBag,
    color: "hsl(350, 80%, 55%)",
    trend: "declining",
    growth: "-2.1%",
    totalJobs: "680K",
    avgSalary: "$58,000",
    demandTrend: [
      { month: "Jan", demand: 62, hiring: 58 },
      { month: "Feb", demand: 60, hiring: 56 },
      { month: "Mar", demand: 59, hiring: 55 },
      { month: "Apr", demand: 58, hiring: 54 },
      { month: "May", demand: 57, hiring: 53 },
      { month: "Jun", demand: 56, hiring: 52 },
      { month: "Jul", demand: 55, hiring: 51 },
      { month: "Aug", demand: 54, hiring: 50 },
      { month: "Sep", demand: 55, hiring: 51 },
      { month: "Oct", demand: 58, hiring: 54 },
      { month: "Nov", demand: 65, hiring: 60 },
      { month: "Dec", demand: 70, hiring: 65 },
    ],
    topRoles: [
      { role: "E-commerce Manager", openings: 18000, growth: 12 },
      { role: "Digital Marketing", openings: 25000, growth: 8 },
      { role: "Supply Chain Analyst", openings: 15000, growth: 6 },
      { role: "UX Designer", openings: 12000, growth: 15 },
      { role: "Customer Success", openings: 20000, growth: 4 },
    ],
    skillDemand: [
      { skill: "Digital Marketing", demand: 88 },
      { skill: "E-commerce Platforms", demand: 82 },
      { skill: "Data Analytics", demand: 75 },
      { skill: "Customer Experience", demand: 80 },
      { skill: "Inventory Management", demand: 70 },
    ],
  },
};

const marketOverview = [
  { sector: "Tech", jobs: 2400, growth: 12.5, color: "hsl(var(--primary))" },
  { sector: "Healthcare", jobs: 1800, growth: 8.2, color: "hsl(142, 76%, 36%)" },
  { sector: "Finance", jobs: 1200, growth: 4.8, color: "hsl(45, 93%, 47%)" },
  { sector: "Manufacturing", jobs: 950, growth: 3.2, color: "hsl(280, 65%, 60%)" },
  { sector: "Retail", jobs: 680, growth: -2.1, color: "hsl(350, 80%, 55%)" },
];

const pieData = [
  { name: "Tech", value: 35, color: "hsl(var(--primary))" },
  { name: "Healthcare", value: 25, color: "hsl(142, 76%, 36%)" },
  { name: "Finance", value: 18, color: "hsl(45, 93%, 47%)" },
  { name: "Manufacturing", value: 14, color: "hsl(280, 65%, 60%)" },
  { name: "Retail", value: 8, color: "hsl(350, 80%, 55%)" },
];

export default function IndustryInsights() {
  const [selectedSector, setSelectedSector] = useState<keyof typeof sectorData>("tech");
  const sector = sectorData[selectedSector];
  const SectorIcon = sector.icon;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "growing":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "growing":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Growing</Badge>;
      case "declining":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Declining</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Stable</Badge>;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Industry Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Industry Insights</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore market trends, job demand, and skill requirements across major industry sectors.
          </p>
        </div>

        <DisclaimerBanner />

        {/* Market Overview Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Market Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Job Market Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Job Market Distribution</CardTitle>
                <CardDescription>Share of job openings by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Growth Comparison */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Sector Growth Rates</CardTitle>
                <CardDescription>Year-over-year employment growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketOverview} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="sector" type="category" stroke="hsl(var(--muted-foreground))" width={90} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Growth"]}
                      />
                      <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                        {marketOverview.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? "hsl(142, 76%, 36%)" : "hsl(350, 80%, 55%)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sector Deep Dive */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Sector Deep Dive</h2>
          
          <Tabs value={selectedSector} onValueChange={(v) => setSelectedSector(v as keyof typeof sectorData)}>
            <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-2 mb-6">
              {Object.entries(sectorData).map(([key, data]) => {
                const Icon = data.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="w-4 h-4" />
                    {data.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedSector} className="space-y-6">
              {/* Sector Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Jobs</p>
                        <p className="text-xl font-bold">{sector.totalJobs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Salary</p>
                        <p className="text-xl font-bold">{sector.avgSalary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getTrendIcon(sector.trend)}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Growth</p>
                        <p className="text-xl font-bold">{sector.growth}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trend</p>
                        {getTrendBadge(sector.trend)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Demand Trend Chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SectorIcon className="w-5 h-5" style={{ color: sector.color }} />
                    {sector.name} Demand Trend
                  </CardTitle>
                  <CardDescription>12-month demand and hiring activity forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sector.demandTrend}>
                        <defs>
                          <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={sector.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={sector.color} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="hiringGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="demand"
                          stroke={sector.color}
                          fill="url(#demandGradient)"
                          strokeWidth={2}
                          name="Job Demand"
                        />
                        <Area
                          type="monotone"
                          dataKey="hiring"
                          stroke="hsl(var(--muted-foreground))"
                          fill="url(#hiringGradient)"
                          strokeWidth={2}
                          name="Hiring Activity"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Roles & Skills */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Roles in {sector.name}</CardTitle>
                    <CardDescription>Most in-demand positions with growth rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sector.topRoles.map((role, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium">{role.role}</p>
                            <p className="text-sm text-muted-foreground">
                              {role.openings.toLocaleString()} openings
                            </p>
                          </div>
                          <Badge
                            className={
                              role.growth >= 15
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : role.growth >= 8
                                ? "bg-primary/20 text-primary border-primary/30"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            +{role.growth}% growth
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">In-Demand Skills</CardTitle>
                    <CardDescription>Key skills employers are seeking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sector.skillDemand.map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{skill.skill}</span>
                            <span className="text-muted-foreground">{skill.demand}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${skill.demand}%`,
                                backgroundColor: sector.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Academic Note */}
      </div>
    </div>
  );
}
