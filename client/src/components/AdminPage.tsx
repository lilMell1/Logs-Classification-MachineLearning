import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../redux/store";
import PageTitle from '../elements/PageTitle';
import "../css/adminPage.css";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "restricted";
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>(
          `${process.env.REACT_APP_SERVER_BASE_URL}/adminApi/users`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
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
      await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/adminApi/users/${id}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, role } : user))
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const deleteUser = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;

    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/adminApi/users/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.trim().toLowerCase();
    const username = user.username.trim().toLowerCase();
    const email = user.email.trim().toLowerCase();

    return username.includes(search) || email.includes(search);
  });

  return (
    <div className="ap-container">
      <div className="ap-header">
        <button className="ap-back-btn" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
      <PageTitle title="Admin Page" />

      <div className="ap-content">
        <h1 className="ap-title">Admin Panel</h1>

        <input
          type="text"
          placeholder="Search by username or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ap-search-input"
        />

        <div className="ap-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Change Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td className="ap-role-text">{user.role}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateRole(user._id, e.target.value as "admin" | "user" | "restricted")
                      }
                      className="ap-select"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </td>
                  <td>
                    <button className="ap-delete-btn" onClick={() => deleteUser(user._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

}
