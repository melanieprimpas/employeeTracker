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
  
  //creates custom table 
  export function printCustomTable(data: EmployeeTracker[]): void {
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
  