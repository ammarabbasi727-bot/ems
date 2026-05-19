import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Employee from "@/models/Employee";
import Department from "@/models/Department";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const [totalEmployees, totalDepts, employees] = await Promise.all([
    Employee.countDocuments(),
    Department.countDocuments(),
    Employee.find().lean(),
  ]);

  const monthlyPayroll = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);
  
  // Group by department for the breakdown chart
  const deptMap: Record<string, number> = {};
  employees.forEach(e => {
    deptMap[e.department] = (deptMap[e.department] || 0) + 1;
  });

  const deptBreakdown = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  return NextResponse.json({
    totalEmployees,
    activeDepartments: totalDepts,
    monthlyPayroll,
    attendanceRate: 94, // Mocked for now
    newHires: 5,        // Mocked for now
    leaveRequests: 12,  // Mocked for now
    months: [
      { month: "Jan", employees: 40, revenue: 2400 },
      { month: "Feb", employees: 45, revenue: 3000 },
      { month: "Mar", employees: 48, revenue: 3200 },
      { month: "Apr", employees: 50, revenue: 3800 },
      { month: "May", employees: totalEmployees, revenue: monthlyPayroll / 10 },
      { month: "Jun", employees: totalEmployees, revenue: monthlyPayroll / 8 },
    ],
    deptBreakdown
  });
}