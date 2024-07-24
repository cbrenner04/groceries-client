interface IUserList {
  user: {
    id: string;
    email: string;
  };
  users_list: {
    id: string;
    permissions: string;
  };
}

export default IUserList;
