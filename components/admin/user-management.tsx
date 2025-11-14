"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
}

// Mock API functions for now
const mockGetUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", name: "Alice Smith", email: "alice@example.com", role: "user" },
        { id: "2", name: "Bob Johnson", email: "bob@example.com", role: "admin" },
        { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "user" },
        { id: "4", name: "Diana Prince", email: "diana@example.com", role: "super_admin" },
      ]);
    }, 500);
  });
};

const mockUpdateUserRole = async (
  userId: string,
  newRole: "user" | "admin" | "super_admin"
): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real application, you'd update a database here
      console.log(`Updating user ${userId} to role ${newRole}`);
      // Simulate success
      resolve({ id: userId, name: "Updated User", email: "updated@example.com", role: newRole });
    }, 500);
  });
};

interface UserManagementProps {
  currentUser: any;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const fetchedUsers = await mockGetUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch users.",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: "user" | "admin" | "super_admin") => {
    if (currentUser.role !== "super_admin" && newRole === "admin") {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: "Only Super Admins can grant Admin roles.",
      });
      return;
    }

    if (currentUser.id === userId && newRole !== currentUser.role) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: "You cannot change your own role.",
      });
      return;
    }

    try {
      await mockUpdateUserRole(userId, newRole);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      Swal.fire({
        icon: "success",
        title: "Role Updated",
        text: `User role updated to ${newRole}.`,
      });
    } catch (error) {
      console.error("Failed to update user role:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update user role.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage User Roles</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <div>Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(newRole) =>
                        handleRoleChange(u.id, newRole as "user" | "admin" | "super_admin")
                      }
                      disabled={currentUser.role !== "super_admin" && u.role === "super_admin"} // Only super admin can change super admin roles
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        {currentUser.role === "super_admin" && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                        {currentUser.role === "super_admin" && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleChange(u.id, u.role)}
                      disabled={
                        (currentUser.role !== "super_admin" && u.role === "super_admin") ||
                        currentUser.id === u.id
                      }
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
