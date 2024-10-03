--VIEW ALL DEPARTMENTS
SELECT * FROM departments

--VIEW ALL ROLES

--SELECT r.id, r.title, d.name, r.salary
--FROM roles r
--JOIN departments d ON r.department_id = d.id



--VIEW ALL EMPLOYEES

--SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, m.first_name || ' '|| m.last_name as manager 
--FROM employees e
--JOIN roles r ON e.role_id = r.id
--JOIN departments d ON r.department_id = d.id
--LEFT JOIN employees m on e.manager_id = m.id


