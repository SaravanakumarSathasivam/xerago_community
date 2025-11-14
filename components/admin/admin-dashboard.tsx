"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Settings, BarChart } from 'lucide-react';
import { UserManagement } from './user-management'; // We will create this next

interface AdminDashboardProps {
  currentUser: any;
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="md:w-1/4">
          <CardContent className="p-4 space-y-2">
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" /> User Management
            </Button>
            <Button
              variant={activeTab === 'content' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('content')}
            >
              <FileText className="mr-2 h-4 w-4" /> Content Moderation
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" /> General Settings
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart className="mr-2 h-4 w-4" /> Analytics
            </Button>
          </CardContent>
        </Card>

        <div className="md:w-3/4">
          {activeTab === 'users' && <UserManagement currentUser={currentUser} />}
          {activeTab === 'content' && (
            <Card>
              <CardContent className="p-6">Content Moderation Section (Coming Soon)</CardContent>
            </Card>
          )}
          {activeTab === 'settings' && (
            <Card>
              <CardContent className="p-6">General Settings Section (Coming Soon)</CardContent>
            </Card>
          )}
          {activeTab === 'analytics' && (
            <Card>
              <CardContent className="p-6">Analytics Section (Coming Soon)</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
