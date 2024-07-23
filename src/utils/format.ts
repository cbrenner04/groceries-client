import moment from 'moment';

const formatDate = (date: Date | string) => moment(date).format('MMMM DD YYYY, h:mm:ss a');
const formatDueBy = (date?: Date | string | number) => (date ? moment(date).format('YYYY-MM-DD') : undefined);
const prettyDueBy = (date: Date | string) => moment(date).format('LL');
const capitalize = (category: string) => category.charAt(0).toUpperCase() + category.slice(1);
const prettyListType = (listType: string) => listType.replace(/([A-Z])/g, ($1) => ` ${$1.toUpperCase()}`);

export { formatDate, formatDueBy, prettyDueBy, capitalize, prettyListType };
