import moment from 'moment';

const formatDate = (date: Date) => moment(date).format('MMMM DD YYYY, h:mm:ss a');
const formatDueBy = (date: Date | undefined) => (date ? moment(date).format('YYYY-MM-DD') : '');
const prettyDueBy = (date: Date) => moment(date).format('LL');
const capitalize = (category: string) => category.charAt(0).toUpperCase() + category.slice(1);
const prettyListType = (listType: string) => listType.replace(/([A-Z])/g, ($1) => ` ${$1.toUpperCase()}`);

export { formatDate, formatDueBy, prettyDueBy, capitalize, prettyListType };
