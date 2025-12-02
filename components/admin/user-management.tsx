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
import { getAdminUsers, updateAdminUserRole } from "@/lib/api";
import { IUser } from '@/models/user';

interface IAdminUserTable extends IUser {
  id: string; // Map _id to id for convenience
  status: "active" | "suspended"; // Assuming this is derived or comes from API
}

interface UserManagementProps {
  currentUser: IUser;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<IAdminUserTable[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const fetchedUsers = await getAdminUsers();
      setUsers(fetchedUsers.data.users.map(u => ({
        ...u,
        id: u._id,
        status: u.isActive ? "active" : "suspended"
      })));
    } catch (error: unknown) {
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

    if (currentUser._id === userId && newRole !== currentUser.role) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: "You cannot change your own role.",
      });
      return;
    }

    try {
      await updateAdminUserRole(userId, newRole);
      setUsers((prevUsers: IAdminUserTable[]) =>
        prevUsers.map((user: IAdminUserTable) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      Swal.fire({
        icon: "success",
        title: "Role Updated",
        text: `User role updated to ${newRole}.`,
      });
    } catch (error: unknown) {
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
              {users.map((u: IAdminUserTable) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(newRole) =>
                        handleRoleChange(u.id, newRole as "user" | "admin" | "super_admin")
                      }
                      disabled={currentUser.role !== "super_admin" && u.role === "super_admin"} 
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
                        currentUser._id === u._id
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
