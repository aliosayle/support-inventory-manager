
import { users } from '@/utils/mockData';
import UserList from '@/components/users/UserList';

const Users = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions for the IT support system.
        </p>
      </div>

      <UserList users={users} />
    </div>
  );
};

export default Users;
