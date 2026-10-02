const fs = require('fs');
const xlsx = require('xlsx');

const files = fs.readdirSync('.').filter(f => f.endsWith('.xlsx'));
console.log('Found excel files:', files);

if (files.length > 0) {
  const wb = xlsx.readFile(files[0]);
  console.log('Sheet names:', wb.SheetNames);
  wb.SheetNames.forEach(sheetName => {
    console.log('\n=============================================');
    console.log('SHEET:', sheetName);
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
    console.log('Total rows:', data.length);
    data.forEach((row, i) => {
      if (row.some(cell => cell !== undefined && cell !== '')) {
        console.log(`[R${i+1}]`, JSON.stringify(row));
      }
    });
  });
}
