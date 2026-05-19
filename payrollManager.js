const Ajv = require('ajv');
const ajv = new Ajv(); // Using Ajv from your node_modules for validation

/**
 * Schema definition for an Employee
 */
const employeeSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string", minLength: 2 },
    position: { type: "string" },
    deptId: { type: "string" },
    baseSalary: { type: "number", minimum: 0 },
    hourlyRate: { type: "number", minimum: 0 },
    type: { enum: ["salaried", "hourly"] }
  },
  required: ["name", "position", "type", "deptId"],
  additionalProperties: false
};

const deptSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string", minLength: 2 }
  },
  required: ["name"],
  additionalProperties: false
};

const attendanceSchema = {
  type: "object",
  properties: {
    empId: { type: "string" },
    date: { type: "string" },
    hoursWorked: { type: "number", minimum: 0 }
  },
  required: ["empId", "date", "hoursWorked"]
};

const leaveSchema = {
  type: "object",
  properties: {
    empId: { type: "string" },
    type: { enum: ["sick", "vacation", "casual"] },
    days: { type: "number", minimum: 1 }
  },
  required: ["empId", "type", "days"]
};

const settingsSchema = {
  type: "object",
  properties: {
    taxRate: { type: "number", minimum: 0, maximum: 1 },
    companyName: { type: "string" }
  }
};

const validateEmployee = ajv.compile(employeeSchema);
const validateDept = ajv.compile(deptSchema);
const validateAttendance = ajv.compile(attendanceSchema);
const validateLeave = ajv.compile(leaveSchema);
const validateSettings = ajv.compile(settingsSchema);

class PayrollManager {
  constructor() {
    this.employees = [];
    this.departments = [];
    this.attendance = [];
    this.leaves = [];
    this.settings = {
      taxRate: 0.20, // Default 20%
      companyName: "My EMS System"
    };
  }

  /**
   * ADD: Validates and adds a new employee to the system
   */
  addEmployee(employeeData) {
    const valid = validateEmployee(employeeData);
    if (!valid) {
      throw new Error(`Validation Error: ${ajv.errorsText(validateEmployee.errors)}`);
    }

    // Verify department exists
    const dept = this.departments.find(d => d.id === employeeData.deptId);
    if (!dept) {
      throw new Error(`Department ID ${employeeData.deptId} does not exist.`);
    }

    const newEmployee = {
      ...employeeData,
      id: employeeData.id || `EMP_${Date.now()}`,
      createdAt: new Date()
    };

    this.employees.push(newEmployee);
    console.log(`Successfully added employee: ${newEmployee.name}`);
    return newEmployee;
  }

  /**
   * DEPARTMENTS: Add and View
   */
  addDepartment(name) {
    const deptData = { name };
    if (!validateDept(deptData)) throw new Error("Invalid Dept Name");
    const newDept = { id: `DEPT_${Date.now()}`, name };
    this.departments.push(newDept);
    return newDept;
  }

  viewDepartments() {
    return this.departments;
  }

  /**
   * ATTENDANCE: Add record
   */
  addAttendance(record) {
    if (!validateAttendance(record)) throw new Error("Invalid Attendance Record");
    this.attendance.push({ ...record, createdAt: new Date() });
    return record;
  }

  /**
   * LEAVES: Add record
   */
  addLeave(record) {
    if (!validateLeave(record)) throw new Error("Invalid Leave Record");
    this.leaves.push({ ...record, createdAt: new Date() });
    return record;
  }

  /**
   * SETTINGS: Update system configuration
   */
  updateSettings(newSettings) {
    if (!validateSettings(newSettings)) throw new Error("Invalid Settings");
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  /**
   * VIEW: Returns all employees or a specific one by ID
   */
  viewEmployees(id = null) {
    if (id) {
      const emp = this.employees.find(e => e.id === id);
      if (!emp) throw new Error(`Employee with ID ${id} not found.`);
      return emp;
    }
    return this.employees;
  }

  /**
   * PAYROLL: Calculates pay for an employee
   * @param {string} id - Employee ID
   * @param {number} bonus - Manual bonus for salaried employees
   */
  calculatePayroll(id, bonus = 0) {
    const emp = this.viewEmployees(id);
    let grossPay = 0;
    let totalHours = 0;
    let leaveDeduction = 0;

    // Calculate Leave Deductions (Example: 1 day = 1/22 of monthly salary)
    const empLeaves = this.leaves.filter(l => l.empId === id);
    const totalLeaveDays = empLeaves.reduce((sum, l) => sum + l.days, 0);

    if (emp.type === 'salaried') {
      const dailyRate = emp.baseSalary / 22;
      leaveDeduction = totalLeaveDays * dailyRate;
      grossPay = (emp.baseSalary + bonus) - leaveDeduction;
    } else if (emp.type === 'hourly') {
      // Sum hours from attendance
      totalHours = this.attendance
        .filter(a => a.empId === id)
        .reduce((sum, rec) => sum + rec.hoursWorked, 0);
      
      grossPay = emp.hourlyRate * totalHours;
    }

    // Use settings for Tax
    const tax = grossPay * this.settings.taxRate;
    const netPay = grossPay - tax;

    return {
      company: this.settings.companyName,
      employeeName: emp.name,
      grossPay: grossPay.toFixed(2),
      taxDeduction: tax.toFixed(2),
      leaveDaysDeducted: totalLeaveDays,
      netPay: netPay.toFixed(2),
      hoursTracked: totalHours,
      processedAt: new Date()
    };
  }
}

// --- WORK EXAMPLE ---
try {
  const ems = new PayrollManager();

  // 1. Add Departments
  const itDept = ems.addDepartment("IT");

  // 2. Add Employees
  const john = ems.addEmployee({ name: "John Doe", position: "Developer", deptId: itDept.id, baseSalary: 5000, type: "salaried" });
  const jane = ems.addEmployee({ name: "Jane Smith", position: "Designer", deptId: itDept.id, hourlyRate: 50, type: "hourly" });

  // 3. Add Attendance for Jane
  ems.addAttendance({ empId: jane.id, date: "2023-10-01", hoursWorked: 8 });
  ems.addAttendance({ empId: jane.id, date: "2023-10-02", hoursWorked: 7 });

  // 4. Add Leave for John
  ems.addLeave({ empId: john.id, type: "sick", days: 2 });

  // 5. View Data
  console.log("Current Employees:", ems.viewEmployees());
  console.log("Departments:", ems.viewDepartments());

  // 6. Process Payroll
  console.log("Payroll for John (with $500 bonus):", ems.calculatePayroll(john.id, 500));
  console.log("Payroll for Jane (calculated from attendance):", ems.calculatePayroll(jane.id));
} catch (err) {
  console.error("System Error:", err.message);
}