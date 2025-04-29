import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../redux/store"; 
import "../css/adminPage.css"; 

interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "restricted";
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>(`${process.env.REACT_APP_SERVER_BASE_URL}/adminApi/users`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken]);

  const updateRole = async (id: string, role: "admin" | "user" | "restricted") => {
    try {
      await axios.put(`${process.env.REACT_APP_SERVER_BASE_URL}/adminApi/users/${id}/role`, { role }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      setUsers(prev =>
        prev.map(user => (user._id === id ? { ...user, role } : user))
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  return (
    <div className="admin-container">
      <div className="home-header">
        <button className="home-logout-btn" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
      <div className="admin-content">
        <h1 className="admin-title">Admin Panel</h1>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td className="admin-role-text">{user.role}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user._id, e.target.value as "admin" | "user" | "restricted")}
                    className="admin-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
