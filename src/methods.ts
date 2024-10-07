import inquirer from "inquirer";
import { QueryResult } from 'pg';
import { pool } from './connection.js';
import * as GetModules from './get.js';
import * as CustomTable from './table.js';

//create function to view departments. 
//Uses a promise to require completion before select methods is called in the cli
export const viewDepartments = () => {
    return new Promise<void>((resolve, reject) => {
        pool.query(
            `SELECT * FROM departments`, (err: Error, result: QueryResult) => {
                if (err) {
                    reject(err);
                } else if (result) {
                    console.log("\n");
                    //console.log(result.rows);
                    //console.table(result.rows, ["id", "name"]); 
                    CustomTable.printCustomTable(result.rows);
                    console.log("\n");
                    resolve();
                }
            });
    })
};

//function to viewRoles
export const viewRoles = () => {
    return new Promise<void>((resolve, reject) => {
        pool.query(
            `SELECT r.id, r.title, d.name, r.salary
            FROM roles r
            JOIN departments d ON r.department_id = d.id`, (err: Error, result: QueryResult) => {
            if (err) {
                reject(err);
            } else if (result) {
                console.log("\n");
                CustomTable.printCustomTable(result.rows);
                console.log("\n");
                resolve();
            }
        });
    })
};

//function to view employees
export const viewEmployees = () => {
    return new Promise<void>((resolve, reject) => {
        pool.query(
            `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, m.first_name || ' '|| m.last_name as manager 
                FROM employees e
                JOIN roles r ON e.role_id = r.id
                JOIN departments d ON r.department_id = d.id
                LEFT JOIN employees m on e.manager_id = m.id`, (err: Error, result: QueryResult) => {
            if (err) {
                reject(err);
            } else if (result) {
                console.log("\n");
                CustomTable.printCustomTable(result.rows);
                console.log("\n");
                resolve();
            }
        });
    })
};

//async function to add a department
export const addDepartment = async () => {
    //use inquirer.prompt to get user input
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'newDepartment',
            message: 'Enter new department name to add: ',
        }
    ]);
    //try catch to handle errors
    try {
        await pool.query(
            `INSERT INTO departments (name) VALUES ($1)`, [answer.newDepartment]
        );
        console.log(`New department has been successfully added.`);
    } catch (err) {
        console.error('Error adding department:', err);
    }
};

//async function to add roles
//uses function getDepartments to get the list of departments
export const addRoles = async () => {
    const departments = await GetModules.getDepartments();
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'newRole',
            message: 'Enter new role name to add: ',
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'Enter the salary for the new role: ',
        },
        {
            type: 'list',
            name: 'roleDepartment',
            message: 'Select the department for the new role: ',
            //maps through list of departments, once department is selected the department.id is returned
            choices: departments.map(department => ({
                name: department.name,
                value: department.id
            }))
        }
    ])
    try {
        await pool.query(`INSERT INTO roles (title, salary, department_id)
        VALUES ($1, $2, $3)`, [answer.newRole, answer.roleSalary, answer.roleDepartment]);
        console.log(`New role has been successfully added.`);
    } catch (err) {
        console.error('Error adding role:', err);
    }
};

//async function to add employees
//uses function getroles and get managers 
export const addEmployees = async () => {
    const roles = await GetModules.getRoles();
    const managers = await GetModules.getManagers();

    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'employeeFirst',
            message: `Enter new employee's first name: `,
        },
        {
            type: 'input',
            name: 'employeeLast',
            message: `Enter new employee's last name: `,
        },
        {
            type: 'list',
            name: 'employeeRole',
            message: 'Select the role for the new employee: ',
            choices: roles.map(role => ({
                name: role.name,
                value: role.id
            }))
        },
        {
            type: 'list',
            name: 'employeeManager',
            message: 'Select the manager for the new employee, if any: ',
            choices: [
                ...managers.map(manager => ({
                    name: manager.name,
                    value: manager.id
                })),
                {
                    name: 'No Manager',
                    value: null
                }]
        }
    ])
    try {
        await pool.query(`
            INSERT INTO employees (first_name, last_name, role_id, manager_id)
            VALUES ($1, $2, $3, $4)`, [answer.employeeFirst, answer.employeeLast, answer.employeeRole, answer.employeeManager]);
            console.log(`New employee has successfully added.`);
    } catch (err) {
        console.error('Error adding employee:', err);
    }
};
//async function to update role's department
//uses function getroles, getemployees, getmanagers 
export const updateRole = async () => {
    const roles = await GetModules.getRoles();
    const departments = await GetModules.getDepartments();
    
    const answer = await inquirer.prompt([
    {
        type: 'list',
        name: 'role',
        message: `Select a role to update: `,
        choices: roles.map(role => ({
            name: role.name,
            value: role.id
        }))
        },
        {
        type: 'list',
        name: 'newDepartment',
        message: `Select the new department for the role: `,
        choices: departments.map(department => ({
            name: department.name,
            value: department.id
        }))
        },

    ]) 
    try {
        await pool.query(`
            UPDATE roles
            SET department_id = $1
            WHERE id = $2; `, [answer.newDepartment, answer.role]);
            console.log(`Role's department has been updated successfully.`)
                
    } catch (err) {
        console.error('Error updating role:', err);
    }
};

//async function to update employees
//uses function getroles, getemployees, getmanagers 
export const updateEmployee = async () => {
    const roles = await GetModules.getRoles();
    const employees = await GetModules.getEmployees();
    const managers = await GetModules.getManagers();
    
    const answer = await inquirer.prompt([
    {
        type: 'list',
        name: 'employee',
        message: `Select an employee to update: `,
        choices: employees.map(employee => ({
            name: employee.name,
            value: employee.id
        }))
        },
        {
        type: 'list',
        name: 'newRole',
        message: `Select the new role for the employee: `,
        choices: roles.map(role => ({
            name: role.name,
            value: role.id
        }))
        },
        {
        type: 'list',
        name: 'employeeManager',
        message: `Select the new manager, if any, for the employee's new position: `,
        //maps through managers and also adds a no manager option which returns null
        choices: [
            ...managers.map(manager => ({
            name: manager.name,
            value: manager.id
            })),
            {
            name: 'No Manager',
            value: null
            }]
        }
    ]) 
    try {
        await pool.query(`
            UPDATE employees
            SET role_id = $1,
                manager_id = $2
            WHERE id = $3; `, [answer.newRole, answer.employeeManager, answer.employee]);
            console.log(`Employee's role has been updated successfully.`)
                
    } catch (err) {
        console.error('Error updating employee:', err);
    }
};

//function to delete department
export const deleteDepartment = async () => {
    //gets list of employee
    const departments = await GetModules.getDepartments();

    const answer = await
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'departments',
                    message: `Select a department to delete: `,
                    choices: departments.map(department => ({
                        name: department.name,
                        value: department.id
                    }))
                },
                {
                    type: 'confirm',
                    name: 'confirmDelete',
                    message: 'Are you sure you want to delete this department?',
                    default: false
                }
            ]);
        
            if (!answer.confirmDelete) {
                console.log('Department deletion canceled.');
                return;
            }
    try {
        // first pool.query updates any related roles that were apart of the deleted department
        await pool.query(`UPDATE roles
            SET department_id = null
            WHERE department_id = $1;`, [answer.departments]);
        //second pool.query deletes department
        await pool.query(`
            DELETE FROM departments
            WHERE id = $1;`, [answer.departments]);


        console.log(`Department has been successfully deleted. Roles that were apart of this department must be updated or deleted. Please view roles with missing departments.`)
    } catch (err) {
        console.error('Error deleting department:', err);
    }

};
//function to delete role
export const deleteRole = async () => {
    const roles = await GetModules.getRoles();

    const answer = await
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: `Select an role to delete: `,
                    choices: roles.map(role => ({
                        name: role.name,
                        value: role.id
                    }))
                },
                {
                    type: 'confirm',
                    name: 'confirmDelete',
                    message: 'Are you sure you want to delete this role?',
                    default: false
                }
            ]);
        
            if (!answer.confirmDelete) {
                console.log('Role deletion canceled.');
                return;
            }
        
    try {
         // first pool.query updates any related employees that had the deleted employee as the manager
        await pool.query(`UPDATE employees
            SET role_id = null
            WHERE role_id = $1;`, [answer.role]);
        //second pool.query deletes role
        await pool.query(`
            DELETE FROM roles
            WHERE id = $1;`, [answer.role]);
       
        console.log(`Role has been successfully deleted. Employees who had this role will need to be updated or deleted. Please view employees for missing role titles.`)
    } catch (err) {
        console.error('Error deleting role:', err);
    }

};

//function to delete employee
export const deleteEmployee = async () => {
    //gets list of employee
    const employees = await GetModules.getEmployees();
  

    const answer = await
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: `Select an employee to delete: `,
                    choices: employees.map(employee => ({
                        name: employee.name,
                        value: employee.id
                    }))
                },
            ])
    try {
        // first pool.query updates any related employees that had the deleted employee as the manager
        await pool.query(`UPDATE employees
            SET manager_id = null
            WHERE manager_id = $1;`, [answer.employee]);
        //second pool.query deletes employee
        await pool.query(`
            DELETE FROM employees
            WHERE id = $1;`, [answer.employee]);

        console.log(`Employee has been successfully deleted.`)
    } catch (err) {
        console.error('Error deleting employee:', err);
    }

};

