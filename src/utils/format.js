import moment from 'moment';

const formatDate = date => moment(date).format('MMMM DD YYYY, h:mm:ss a');
const defaultDueBy = () => moment().format('YYYY-MM-DD');
const formatDueBy = date => moment(date).format('YYYY-MM-DD');
const prettyDueBy = date => moment(date).format('LL');
const listTypeToSnakeCase = listType => listType.replace(/([A-Z])/g, $1 => `_${$1}`.toLowerCase()).slice(1);
const capitalize = category => category.charAt(0).toUpperCase() + category.slice(1);

export { formatDate, defaultDueBy, formatDueBy, prettyDueBy, listTypeToSnakeCase, capitalize };
