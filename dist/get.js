import { pool } from './connection.js';
//Get departments
export const getDepartments = async () => {
    //get list of departments name and id
    const results = await pool.query('SELECT id, name FROM departments');
    const departments = results.rows.map(department => ({
        name: department.name,
        id: department.id
    }));
    return (departments);
};
//Get Roles
export const getRoles = async () => {
    //get list of roles title and id
    const results = await pool.query('SELECT id, title FROM roles');
    const roles = results.rows.map(role => ({
        name: role.title,
        id: role.id
    }));
    return (roles);
};
//Get Employees
export const getEmployees = async () => {
    //Get List of employees
    const results = await pool.query('SELECT id, first_name, last_name FROM employees');
    const employees = results.rows.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        id: employee.id
    }));
    return (employees);
};
//Get Managers
export const getManagers = async () => {
    //get list of managers
    const results = await pool.query('SELECT id, first_name, last_name FROM employees');
    const managers = results.rows.map(manager => ({
        name: `${manager.first_name} ${manager.last_name}`,
        id: manager.id
    }));
    return (managers);
};
