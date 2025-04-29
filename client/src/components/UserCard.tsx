interface User {
    _id: string;
    username: string;
    role: "admin" | "user" | "restricted";
  }
  
  interface UserCardProps {
    user: User;
    onRoleChange: (id: string, role: "admin" | "user" | "restricted") => void;
  }
  
  export default function UserCard({ user, onRoleChange }: UserCardProps) {
    return (
      <div className="user-card">
        <h4>{user.username}</h4>
        <p>Role: {user.role}</p>
        <select
          value={user.role}
          onChange={(e) =>
            onRoleChange(user._id, e.target.value as "admin" | "user" | "restricted")
          }
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="restricted">Restricted</option>
        </select>
      </div>
    );
  }
  