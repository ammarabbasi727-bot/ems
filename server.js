const express = require('express');
const bodyParser = require('body-parser');
const PayrollManager = require('./payrollManager');

const app = express();
const ems = new PayrollManager();

app.use(bodyParser.json());

// FIX 404: Route for Departments
app.post('/api/departments', (req, res) => {
    try {
        const dept = ems.addDepartment(req.body.name);
        res.status(201).json(dept);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// FIX 404: Route for Employees
app.post('/api/employees', (req, res) => {
    try {
        const emp = ems.addEmployee(req.body);
        res.status(201).json(emp);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// FIX 404: Route for Attendance
app.post('/api/attendance', (req, res) => {
    try {
        const record = ems.addAttendance(req.body);
        res.status(201).json(record);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// FIX 404: Route for Leaves
app.post('/api/leaves', (req, res) => {
    try {
        const record = ems.addLeave(req.body);
        res.status(201).json(record);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// FIX 404: Route for Payroll Calculation
app.get('/api/payroll/:id', (req, res) => {
    try {
        const report = ems.calculatePayroll(req.params.id, req.query.bonus ? parseFloat(req.query.bonus) : 0);
        res.json(report);
    } catch (e) { res.status(404).json({ error: e.message }); }
});

// FIX 404: Route for Settings
app.post('/api/settings', (req, res) => {
    try {
        const settings = ems.updateSettings(req.body);
        res.json(settings);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Pre-populate one dept so the system works immediately
    ems.addDepartment("General");
});