import inquirer from "inquirer";
import express from 'express';
//import { QueryResult } from 'pg';
import { connectToDb } from './connection.js';
//import * as GetModules from './get.js';
import * as Methods from './methods.js';
//import * as CustomTable from './table.js';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


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
            `Update a role's department`,
            'Update an employee role or manager',
            'Delete a department',
            'Delete a role',
            'Delete an employee',
            'exit',
          ]
        }
      ])
      .then((answers) => {
        // console.log( `${answers.options}`)
        if (answers.options === 'View all departments') {
          Methods.viewDepartments().then(() => {
            this.selectMethod();
          });

        } else if (answers.options === 'View all roles') {
          Methods.viewRoles().then(() => {
            this.selectMethod();
          });
          

        } else if (answers.options === 'View all employees') {
          Methods.viewEmployees().then(() => {
            this.selectMethod();
          });

        } else if (answers.options === 'Add a department') {
          Methods.addDepartment().then(() => {
            this.selectMethod();
          });

        } else if (answers.options === 'Add a role') {
          Methods.addRoles().then(() => {
            this.selectMethod();
          });

        } else if (answers.options === 'Add an employee') {
          Methods.addEmployees().then(() => {
            this.selectMethod();
          });
        } else if (answers.options === `Update a role's department`){
          Methods.updateRole().then(() => {
            this.selectMethod();
          });
        } else if (answers.options === 'Update an employee role or manager') {
          Methods.updateEmployee().then(() => {
            this.selectMethod();
          });
        } else if (answers.options === 'Delete a department') {
          Methods.deleteDepartment().then(() => {
            this.selectMethod();
          }); 
        } else if (answers.options === 'Delete a role') {
          Methods.deleteRole().then(() => {
            this.selectMethod();
          }); 
        } else if (answers.options === 'Delete an employee') {
          Methods.deleteEmployee().then(() => {
            this.selectMethod();
          });
        }
        else if (answers.options === 'exit') {
        process.exit();
      } 

})}};
new Cli();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});