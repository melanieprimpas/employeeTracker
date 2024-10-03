import inquirer from "inquirer";
import express from 'express';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//define interface that holds all the catagories for the department, role and employee table
interface EmployeeTracker {
  // all of the properties are optional except ID since the different tables are require different inputs
  id: number;
  first_name?: string;
  last_name?: string;
  title?: string;
  salary?: number;
  name?: string;
  manager?: string;
}

function printCustomTable(data: EmployeeTracker[]): void {
  //check to ensure data is not empty
  if (data.length === 0) return;

  //sets the headers of the table from the first entry in the data array
  //returns an array with header titles
  const headers = Object.keys(data[0]) as (keyof EmployeeTracker)[];
  //console.log(headers, "Line 33")

  //sets the necessary width of each column so that we can plan how many "-" are needed 
  //returns an array with the width of each of the header titles ex: id, columnWidths = 2;
  const columnWidths = headers.map(header =>
    Math.max(...data.map(row => String(row[header] || '').length), header.length)
  );
  //console.log(columnWidths, "Line 38")

  //writes the line that separates the headers from the data entries using the correct spacing for column width
  const separator = columnWidths.map(width => '-'.repeat(width)).join(' | ');

  //Prints the created headers for the table
  //uses padEnd to make the strings the correct length by padding the string
  console.log(headers.map((header, index) => header.padEnd(columnWidths[index])).join(' | '));
  //Prints the seperator for the table
  console.log(separator);

  // Prints each row
  //uses padEnd to make the strings the correct length by padding the string
  data.forEach((row: EmployeeTracker) => {
    console.log(headers.map((header, index) => String(row[header] || '').padEnd(columnWidths[index])).join(' | '));
  });
}

class Cli {
  exit: boolean = false;

  constructor() {
    this.selectMethod();
  }

  selectMethod(): void {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'options',
          message: 'Select from the following options:',
          choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Delete an employee',
            'exit',
          ]
        }
      ])
      .then((answers) => {
        // console.log( `${answers.options}`)
        if (answers.options === 'View all departments') {
          pool.query(
            `SELECT * FROM departments`, (err: Error, result: QueryResult) => {
              if (err) {
                console.log(err);
              } else if (result) {
                console.log("\n");
                //console.log(result.rows);
                //console.table(result.rows, ["id", "name"]); 
                printCustomTable(result.rows);
                console.log("\n");
                this.selectMethod();
              }
            });

        } else if (answers.options === 'View all roles') {
          pool.query(
            `SELECT r.id, r.title, d.name, r.salary
                FROM roles r
                JOIN departments d ON r.department_id = d.id`, (err: Error, result: QueryResult) => {
            if (err) {
              console.log(err);
            } else if (result) {
              console.log("\n");
              printCustomTable(result.rows);
              console.log("\n");
              this.selectMethod();
            }
          });

        } else if (answers.options === 'View all employees') {
          pool.query(
            `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, m.first_name || ' '|| m.last_name as manager 
                FROM employees e
                JOIN roles r ON e.role_id = r.id
                JOIN departments d ON r.department_id = d.id
                LEFT JOIN employees m on e.manager_id = m.id`, (err: Error, result: QueryResult) => {
            if (err) {
              console.log(err);
            } else if (result) {
              console.log("\n");
              printCustomTable(result.rows);
              console.log("\n");
              this.selectMethod();
            }
          });

        } else if (answers.options === 'Add a department') {
          inquirer
            .prompt([
              {
                type: 'input',
                name: 'newDepartment',
                message: 'Enter new department name to add: ',
              }
            ])
            .then((answer) => {
              pool.query(`
              INSERT INTO departments (name)
              VALUES ($1)`, [answer.newDepartment]), (err: Error, result: QueryResult) => {

                  if (err) {
                    console.log(err);
                  } else if (result) {
                    console.log(`New department has been successfully added.`);
                    this.selectMethod();

                  }
                }
            })

        } else if (answers.options === 'Add a role') {
          //get list of departments name and id
          pool.query('SELECT id, name FROM departments', (err, results) => {
            if (err) {
              console.log(err);
              return;
            }

            const departments = results.rows.map(department => ({
              name: department.name,
              id: department.id
            }));

            inquirer
              .prompt([
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
                  choices: departments.map(department => ({
                    name: department.name,
                    value: department.id
                  }))
                }
              ])
              .then((answer) => {
                //console.log(answer, "Line 188")
                return pool.query(`
              INSERT INTO roles (title, salary, department_id)
              VALUES ($1, $2, $3)`, [answer.newRole, answer.roleSalary, answer.roleDepartment])
              })
              .then(() => {
                console.log(`New role has been successfully added.`);
                this.selectMethod();
              })
              .catch(err => {
                console.log(err);
              });
          });

        } else if (answers.options === 'Add an employee') {
          //get list of roles title and id
          pool.query('SELECT id, title FROM roles', (err, results) => {
            if (err) {
              console.log(err);
              return;
            }

            const roles = results.rows.map(role => ({
              name: role.title,
              id: role.id
            }));
            //get list of managers
            pool.query('SELECT id, first_name, last_name FROM employees', (err, results) => {
              if (err) {
                console.log(err);
                return;
              }

              const manager = results.rows.map(manager => ({
                name: `${manager.first_name} ${manager.last_name}`,
                id: manager.id
              }));

              inquirer
                .prompt([
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
                      ...manager.map(manager => ({
                        name: manager.name,
                        value: manager.id
                      })),
                      {
                        name: 'No Manager',
                        value: null
                      }]
                  }
                ])
                .then((answer) => {
                  return pool.query(`
                    INSERT INTO employees (first_name, last_name, role_id, manager_id)
                    VALUES ($1, $2, $3, $4)`, [answer.employeeFirst, answer.employeeLast, answer.employeeRole, answer.employeeManager])
                  
                })
                .then(() => {
                 console.log(`New employee has been successfully added.`) 
                 this.selectMethod();
                })
                .catch(err => {
                  console.log(err);
                });


            });

          });
        } else if (answers.options === 'Update an employee role') {
          //Get List of employees
          pool.query('SELECT id, first_name, last_name FROM employees', (err, results) => {
            if (err) {
              console.log(err);
              return;
            }

            const employees = results.rows.map(employee => ({
              name: `${employee.first_name} ${employee.last_name}`,
              id: employee.id

            }));

            //get list of roles title and id
            pool.query('SELECT id, title FROM roles', (err, results) => {
              if (err) {
                console.log(err);
                return;
              }

              const roles = results.rows.map(role => ({
                name: role.title,
                id: role.id
              }));
              //get list of managers
              pool.query('SELECT id, first_name, last_name FROM employees', (err, results) => {
                if (err) {
                  console.log(err);
                  return;
                }

                const manager = results.rows.map(manager => ({
                  name: `${manager.first_name} ${manager.last_name}`,
                  id: manager.id
                }));

                inquirer
                  .prompt([
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
                      choices: [
                        ...manager.map(manager => ({
                          name: manager.name,
                          value: manager.id
                        })),
                        {
                          name: 'No Manager',
                          value: null
                        }]
                    }
                  ])
                  .then((answer) => {
                    return pool.query(`
                    UPDATE employees
                    SET role_id = $1,
                        manager_id = $2
                    WHERE id = $3; `, [answer.newRole, answer.employeeManager, answer.employee]);
                    
                  })
                  .then(() => {
                    console.log(`Employee's role has been updated successfully.`)
                    this.selectMethod();
                  })
                  .catch(err => {
                    console.log(err);
                  });
              });
            });
          });
      } else if (answers.options === 'Delete an employee') {

      }
        else if (answers.options === 'exit') {
        process.exit();
      }

})}};
new Cli();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});