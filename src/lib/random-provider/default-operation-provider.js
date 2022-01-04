const OPERATIONS = ['SPLITX', 'SPLITDLTR', 'SPLITDRTL', 'SPLITY'];
const defaultOperationProvider = () => OPERATIONS[Math.floor(Math.random() * 4)];

export default defaultOperationProvider;
