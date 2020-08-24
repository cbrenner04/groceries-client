import moment from 'moment';

const formatDate = (date) => moment(date).format('MMMM DD YYYY, h:mm:ss a');
const defaultDueBy = () => moment().format('YYYY-MM-DD');
const formatDueBy = (date) => (date ? moment(date).format('YYYY-MM-DD') : '');
const prettyDueBy = (date) => moment(date).format('LL');
const capitalize = (category) => category.charAt(0).toUpperCase() + category.slice(1);
const prettyListType = (listType) => listType.replace(/([A-Z])/g, ($1) => ` ${$1.toUpperCase()}`);

export { formatDate, defaultDueBy, formatDueBy, prettyDueBy, capitalize, prettyListType };
